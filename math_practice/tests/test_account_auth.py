from datetime import datetime, timezone
from unittest.mock import patch

import app as app_module


class FakeDatabase:
    def __init__(self):
        self.accounts = {}
        self.attempts = []
        self.next_account_id = 1


class FakeCursor:
    def __init__(self, database):
        self.database = database
        self.result = None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, query, params=None):
        normalized = ' '.join(query.split()).upper()
        self.result = None
        if normalized.startswith(('CREATE TABLE', 'CREATE INDEX')):
            return
        if normalized.startswith('INSERT INTO LEARNING_ACCOUNTS'):
            email, display_name, password_hash = params
            if email not in self.database.accounts:
                account_id = self.database.next_account_id
                self.database.next_account_id += 1
                now = datetime.now(timezone.utc)
                self.database.accounts[email] = {
                    'id': account_id,
                    'email': email,
                    'display_name': display_name,
                    'password_hash': password_hash,
                    'created_at': now,
                    'last_login_at': now,
                }
                self.result = (account_id, display_name)
        elif normalized.startswith('SELECT ID, DISPLAY_NAME, PASSWORD_HASH'):
            account = self.database.accounts.get(params[0])
            if account:
                self.result = (
                    account['id'],
                    account['display_name'],
                    account['password_hash'],
                )
        elif normalized.startswith('UPDATE LEARNING_ACCOUNTS'):
            account_id = params[0]
            for account in self.database.accounts.values():
                if account['id'] == account_id:
                    account['last_login_at'] = datetime.now(timezone.utc)
        elif normalized.startswith('SELECT ID, EMAIL, DISPLAY_NAME, CREATED_AT'):
            account_id = params[0]
            account = next(
                (item for item in self.database.accounts.values() if item['id'] == account_id),
                None,
            )
            if account:
                self.result = (
                    account['id'],
                    account['email'],
                    account['display_name'],
                    account['created_at'],
                    account['last_login_at'],
                )
        elif normalized.startswith('INSERT INTO ACCOUNT_MATH_ATTEMPTS'):
            account_id, difficulty, was_correct, ability_after, ability_peak = params
            self.database.attempts.append(
                {
                    'account_id': account_id,
                    'difficulty': difficulty,
                    'was_correct': was_correct,
                    'ability_after': ability_after,
                    'ability_peak': ability_peak,
                    'created_at': datetime.now(timezone.utc),
                }
            )
        elif normalized.startswith('SELECT ABILITY_AFTER'):
            matches = [
                attempt for attempt in self.database.attempts
                if attempt['account_id'] == params[0]
            ]
            if matches:
                self.result = (matches[-1]['ability_after'],)
        elif normalized.startswith('SELECT COUNT(*)'):
            account_id = params[1]
            matches = [
                attempt for attempt in self.database.attempts
                if attempt['account_id'] == account_id
            ]
            self.result = (
                len(matches),
                sum(attempt['was_correct'] for attempt in matches),
                max(
                    (attempt['ability_peak'] for attempt in matches),
                    default=params[0],
                ),
                matches[-1]['ability_after'] if matches else None,
                matches[-1]['created_at'] if matches else None,
            )
        elif normalized.startswith('SELECT DIFFICULTY, WAS_CORRECT, CREATED_AT'):
            account_id = params[0]
            matches = [
                attempt for attempt in reversed(self.database.attempts)
                if attempt['account_id'] == account_id
            ][:10]
            self.result = [
                (attempt['difficulty'], attempt['was_correct'], attempt['created_at'])
                for attempt in matches
            ]
        else:
            raise AssertionError(f'Unexpected database query: {normalized}')

    def fetchone(self):
        return self.result

    def fetchall(self):
        return self.result


class FakeConnection:
    def __init__(self, database):
        self.database = database

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def cursor(self):
        return FakeCursor(self.database)

    def commit(self):
        pass

    def close(self):
        pass


def csrf_token(client):
    with client.session_transaction() as session:
        return session['csrf_token']


def test_password_hashing_uses_unique_salts_and_verifies_password():
    first_hash = app_module.hash_account_password('a-long-example-password')
    second_hash = app_module.hash_account_password('a-long-example-password')

    assert first_hash != second_hash
    assert app_module.verify_account_password('a-long-example-password', first_hash)
    assert not app_module.verify_account_password('wrong-password', first_hash)
    assert not app_module.verify_account_password('a-long-example-password', 'invalid')


def test_account_lifecycle_and_math_progress_are_private_and_persisted():
    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        client = app_module.app.test_client()

        assert client.get('/account').status_code == 302
        registration_page = client.get('/account/register')
        assert registration_page.status_code == 200
        response = client.post(
            '/account/register',
            data={
                'csrf_token': csrf_token(client),
                'display_name': 'Learner One',
                'email': 'LEARNER@example.com',
                'password': 'a-long-example-password',
                'password_confirm': 'a-long-example-password',
            },
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert b'Learner One' in response.data
        assert b'0%' in response.data

        assert client.get('/math-practice').status_code == 200
        with client.session_transaction() as session:
            expected_answer = session['current_answer']
        answer = str(float(expected_answer) + 1)
        response = client.post(
            '/math-practice',
            data={
                'csrf_token': csrf_token(client),
                'answer': answer,
                'correct_answer': answer,
                'current_question': 'forged question',
            },
            headers={'X-Requested-With': 'XMLHttpRequest'},
        )
        assert response.status_code == 200
        assert response.json['previous_question']['was_correct'] is False
        assert response.json['previous_question']['question'] != 'forged question'
        assert len(database.attempts) == 1
        assert database.attempts[0]['was_correct'] is False
        saved_ability = database.attempts[0]['ability_after']

        dashboard = client.get('/account')
        assert dashboard.status_code == 200
        assert b'Questions answered</span><strong>1' in dashboard.data
        assert b'Accuracy</span><strong>0%' in dashboard.data

        logout = client.post(
            '/account/logout',
            data={'csrf_token': csrf_token(client)},
        )
        assert logout.status_code == 302
        assert client.get('/account').status_code == 302
        client.get('/account/login')
        login = client.post(
            '/account/login',
            data={
                'csrf_token': csrf_token(client),
                'email': 'learner@example.com',
                'password': 'a-long-example-password',
            },
            follow_redirects=True,
        )
        assert login.status_code == 200
        assert b'Learner One' in login.data
        assert client.get('/math-practice').status_code == 200
        with client.session_transaction() as session:
            assert session['ability'] == saved_ability


def test_account_actions_reject_requests_without_csrf_token():
    client = app_module.app.test_client()

    assert client.post('/account/logout').status_code == 400
    assert client.post('/math-practice').status_code == 400
    assert client.post('/skip').status_code == 400
    assert client.post(
        '/account/register',
        data={
            'display_name': 'Learner',
            'email': 'learner@example.com',
            'password': 'a-long-example-password',
            'password_confirm': 'a-long-example-password',
        },
    ).status_code == 400


def test_skip_replaces_the_session_question():
    client = app_module.app.test_client()

    assert client.get('/math-practice').status_code == 200
    response = client.post(
        '/skip',
        data={'csrf_token': csrf_token(client)},
        headers={'X-Requested-With': 'XMLHttpRequest'},
    )

    assert response.status_code == 200
    with client.session_transaction() as session:
        assert session['current_question'] == response.json['question']
        assert session['current_answer'] == response.json['answer']
