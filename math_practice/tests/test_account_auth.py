from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import app as app_module


class FakeDatabase:
    def __init__(self):
        self.accounts = {}
        self.attempts = []
        self.scores = []
        self.game_coin_rewards = set()
        self.quest_coin_rewards = set()
        self.unit_unlocks = set()
        self.character_inventory = []
        self.next_account_id = 1


class FakeCursor:
    def __init__(self, database):
        self.database = database
        self.result = None
        self.rowcount = -1

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, query, params=None):
        normalized = ' '.join(query.split()).upper()
        self.result = None
        self.rowcount = -1
        if normalized.startswith(('CREATE TABLE', 'CREATE INDEX', 'CREATE UNIQUE INDEX', 'ALTER TABLE')):
            return
        if normalized.startswith('INSERT INTO LEARNING_ACCOUNTS'):
            login_name, display_name, password_hash, coin_balance = params
            normalized_name = login_name.casefold()
            if normalized_name not in self.database.accounts:
                account_id = self.database.next_account_id
                self.database.next_account_id += 1
                now = datetime.now(timezone.utc)
                self.database.accounts[normalized_name] = {
                    'id': account_id,
                    'login_name': login_name,
                    'display_name': display_name,
                    'password_hash': password_hash,
                    'bio': '',
                    'favorite_subject': 'not_set',
                    'learning_goal': 'general',
                    'profile_color': 'sage',
                    'profile_public': False,
                    'coin_balance': coin_balance,
                    'last_daily_bonus_date': now.date(),
                    'created_at': now,
                    'last_login_at': now,
                }
                self.result = (account_id, display_name)
        elif normalized.startswith(
            "SELECT LAST_DAILY_BONUS_DATE = (NOW() AT TIME ZONE 'UTC')::DATE"
        ):
            account = next(
                (item for item in self.database.accounts.values() if item['id'] == params[0]),
                None,
            )
            if account:
                self.result = (
                    account['last_daily_bonus_date'] == datetime.now(timezone.utc).date(),
                )
        elif normalized.startswith('UPDATE LEARNING_ACCOUNTS SET COIN_BALANCE = COIN_BALANCE + CASE'):
            bonus, account_id = params
            for account in self.database.accounts.values():
                if account['id'] == account_id:
                    today = datetime.now(timezone.utc).date()
                    if account['last_daily_bonus_date'] != today:
                        account['coin_balance'] += bonus
                    account['last_daily_bonus_date'] = today
                    account['last_login_at'] = datetime.now(timezone.utc)
        elif normalized.startswith('SELECT COIN_BALANCE FROM LEARNING_ACCOUNTS'):
            account = next(
                (item for item in self.database.accounts.values() if item['id'] == params[0]),
                None,
            )
            if account:
                self.result = (account['coin_balance'],)
        elif normalized.startswith('UPDATE LEARNING_ACCOUNTS SET COIN_BALANCE = COIN_BALANCE -'):
            amount, account_id = params
            for account in self.database.accounts.values():
                if account['id'] == account_id:
                    account['coin_balance'] -= amount
        elif normalized.startswith('UPDATE LEARNING_ACCOUNTS SET COIN_BALANCE = COIN_BALANCE +'):
            amount, account_id = params
            for account in self.database.accounts.values():
                if account['id'] == account_id:
                    account['coin_balance'] += amount
        elif normalized.startswith('INSERT INTO ACCOUNT_CHARACTER_INVENTORY'):
            if len(params) == 3:
                account_id, item_key, is_equipped = params
                item_type, slot = 'character', 'character'
            else:
                account_id, item_type, item_key, slot = params
                is_equipped = False
            if not any(
                row['account_id'] == account_id
                and row['item_type'] == item_type
                and row['item_key'] == item_key
                for row in self.database.character_inventory
            ):
                self.database.character_inventory.append({
                    'account_id': account_id,
                    'item_type': item_type,
                    'item_key': item_key,
                    'slot': slot,
                    'is_equipped': is_equipped,
                })
        elif normalized.startswith('SELECT ITEM_TYPE, ITEM_KEY, SLOT, IS_EQUIPPED'):
            account_id = params[0]
            self.result = [
                (row['item_type'], row['item_key'], row['slot'], row['is_equipped'])
                for row in self.database.character_inventory
                if row['account_id'] == account_id
            ]
        elif normalized.startswith('SELECT 1 FROM ACCOUNT_CHARACTER_INVENTORY'):
            account_id, item_type, item_key = params
            if any(
                row['account_id'] == account_id
                and row['item_type'] == item_type
                and row['item_key'] == item_key
                for row in self.database.character_inventory
            ):
                self.result = (1,)
        elif normalized.startswith('UPDATE ACCOUNT_CHARACTER_INVENTORY SET IS_EQUIPPED = FALSE'):
            account_id, slot = params
            for row in self.database.character_inventory:
                if row['account_id'] == account_id and row['slot'] == slot:
                    row['is_equipped'] = False
        elif normalized.startswith('UPDATE ACCOUNT_CHARACTER_INVENTORY SET IS_EQUIPPED ='):
            is_equipped, account_id, item_type, item_key = params
            for row in self.database.character_inventory:
                if (
                    row['account_id'] == account_id
                    and row['item_type'] == item_type
                    and row['item_key'] == item_key
                ):
                    row['is_equipped'] = is_equipped
        elif normalized.startswith('INSERT INTO ACCOUNT_GAME_COIN_REWARDS'):
            account_id, game_key, coins_awarded = params
            reward_key = (account_id, game_key, datetime.now(timezone.utc).date())
            if reward_key not in self.database.game_coin_rewards:
                self.database.game_coin_rewards.add(reward_key)
                self.result = (account_id,)
        elif normalized.startswith('INSERT INTO ACCOUNT_QUEST_COIN_REWARDS'):
            account_id, topic_id, coins_awarded = params
            reward_key = (account_id, topic_id)
            if reward_key not in self.database.quest_coin_rewards:
                self.database.quest_coin_rewards.add(reward_key)
                self.result = (account_id,)
        elif normalized.startswith('SELECT 1 FROM ACCOUNT_MAP_UNIT_UNLOCKS'):
            account_id, unit_id = params
            if (account_id, unit_id) in self.database.unit_unlocks:
                self.result = (1,)
        elif normalized.startswith('INSERT INTO ACCOUNT_MAP_UNIT_UNLOCKS'):
            account_id, unit_id, coins_spent = params
            self.database.unit_unlocks.add((account_id, unit_id))
        elif normalized.startswith('SELECT ID, DISPLAY_NAME, PASSWORD_HASH'):
            account = next(
                (
                    item for item in self.database.accounts.values()
                    if item['login_name'].casefold() == params[0].casefold()
                ),
                None,
            )
            if account:
                self.result = (
                    account['id'],
                    account['display_name'],
                    account['password_hash'],
                )
        elif normalized.startswith('UPDATE LEARNING_ACCOUNTS SET BIO'):
            bio, favorite_subject, learning_goal, profile_color, profile_public, account_id = params
            account = next(
                (item for item in self.database.accounts.values() if item['id'] == account_id),
                None,
            )
            self.rowcount = 1 if account else 0
            if account:
                account.update(
                    bio=bio,
                    favorite_subject=favorite_subject,
                    learning_goal=learning_goal,
                    profile_color=profile_color,
                    profile_public=profile_public,
                )
        elif normalized.startswith('UPDATE LEARNING_ACCOUNTS'):
            account_id = params[0]
            for account in self.database.accounts.values():
                if account['id'] == account_id:
                    account['last_login_at'] = datetime.now(timezone.utc)
        elif normalized.startswith('SELECT ID, DISPLAY_NAME, CREATED_AT'):
            account_id = params[0]
            account = next(
                (item for item in self.database.accounts.values() if item['id'] == account_id),
                None,
            )
            if account:
                self.result = (
                    account['id'],
                    account['display_name'],
                    account['created_at'],
                    account['last_login_at'],
                    account['bio'],
                    account['favorite_subject'],
                    account['learning_goal'],
                    account['profile_color'],
                    account['profile_public'],
                    account['coin_balance'],
                    account['last_daily_bonus_date'],
                )
        elif normalized.startswith('INSERT INTO ACCOUNT_GAME_SCORES'):
            account_id, game_key, score = params
            existing = next(
                (row for row in self.database.scores
                 if row['account_id'] == account_id and row['game_key'] == game_key),
                None,
            )
            if existing:
                existing['score'] = max(existing['score'], score)
            else:
                self.database.scores.append(
                    {'account_id': account_id, 'game_key': game_key, 'score': score}
                )
        elif normalized.startswith('SELECT S.ACCOUNT_ID, A.DISPLAY_NAME, A.PROFILE_PUBLIC'):
            game_key = params[0]
            matching_accounts = {
                account['id']: account
                for account in self.database.accounts.values()
            }
            grouped_scores = {}
            for score_row in self.database.scores:
                if score_row['game_key'] == game_key:
                    account = matching_accounts[score_row['account_id']]
                    grouped_scores[score_row['account_id']] = max(
                        grouped_scores.get(score_row['account_id'], 0),
                        score_row['score'],
                    )
            self.result = [
                (account_id, matching_accounts[account_id]['display_name'],
                 matching_accounts[account_id]['profile_public'], score)
                for account_id, score in sorted(
                    grouped_scores.items(), key=lambda item: -item[1]
                )
            ][:50]
        elif normalized.startswith('SELECT A.ID, A.DISPLAY_NAME, A.PROFILE_PUBLIC'):
            grouped_scores = {}
            for attempt in self.database.attempts:
                if attempt['was_correct']:
                    grouped_scores[attempt['account_id']] = grouped_scores.get(attempt['account_id'], 0) + 1
            matching_accounts = {
                account['id']: account
                for account in self.database.accounts.values()
            }
            self.result = [
                (account_id, matching_accounts[account_id]['display_name'],
                 matching_accounts[account_id]['profile_public'], score)
                for account_id, score in sorted(
                    grouped_scores.items(), key=lambda item: -item[1]
                )
            ][:50]
        elif normalized.startswith('SELECT ID, DISPLAY_NAME, BIO, FAVORITE_SUBJECT'):
            if 'WHERE ID = %S AND PROFILE_PUBLIC = TRUE' in normalized:
                account = next(
                    (item for item in self.database.accounts.values()
                     if item['id'] == params[0] and item['profile_public']),
                    None,
                )
                if account:
                    self.result = (
                        account['id'], account['display_name'], account['bio'],
                        account['favorite_subject'], account['learning_goal'],
                        account['profile_color'],
                    )
            else:
                self.result = [
                    (
                        account['id'], account['display_name'], account['bio'],
                        account['favorite_subject'], account['learning_goal'],
                        account['profile_color'],
                    )
                    for account in self.database.accounts.values()
                    if account['profile_public']
                ]
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
        assert b'name="email"' not in registration_page.data
        assert b'name="password_confirm"' in registration_page.data
        assert registration_page.status_code == 200
        response = client.post(
            '/account/register',
            data={
                'csrf_token': csrf_token(client),
                'display_name': 'Learner One',
                'password': 'a-long-example-password',
                'password_confirm': 'a-long-example-password',
            },
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert b'Learner One' in response.data
        assert b'0%' in response.data
        assert b'id="profile-bio"' in response.data
        assert b'id="profile-public"' in response.data
        assert b'appearance:checkbox' in response.data
        assert '🪙 25'.encode() in response.data
        assert database.accounts['learner one']['coin_balance'] == 25
        assert b'name="last_name"' not in response.data
        game_page = client.get('/math-blast')
        assert b'window.learningAccountContext' in game_page.data
        assert b'"gameKey": "math-blast"' in game_page.data
        assert b'leaderboard_tracking.js' in game_page.data

        profile_update = client.post(
            '/account/profile',
            data={
                'csrf_token': csrf_token(client),
                'bio': 'I enjoy puzzles and science.',
                'favorite_subject': 'science',
                'learning_goal': 'science_exploration',
                'profile_color': 'teal',
                'profile_public': 'yes',
            },
            follow_redirects=True,
        )
        assert profile_update.status_code == 200
        assert b'id="profile-public" type="checkbox" name="profile_public" value="yes" checked' in profile_update.data
        assert b'I enjoy puzzles and science.' in profile_update.data
        assert b'Explore science' in profile_update.data
        saved_profile = database.accounts['learner one']
        assert saved_profile['bio'] == 'I enjoy puzzles and science.'
        assert saved_profile['profile_color'] == 'teal'
        assert saved_profile['profile_public'] is True

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
                'login_name': 'learner one',
                'password': 'a-long-example-password',
            },
            follow_redirects=True,
        )
        assert login.status_code == 200
        assert b'Learner One' in login.data
        score_response = client.post(
            '/api/leaderboards/scores',
            data={
                'csrf_token': csrf_token(client),
                'game_key': 'math-blast',
                'score': '120',
            },
        )
        assert score_response.status_code == 200
        assert score_response.json['coins_awarded'] == app_module.DAILY_GAME_COIN_BONUS
        assert score_response.json['coin_balance'] == 30
        board_response = client.get('/leaderboards?game=math-blast')
        assert board_response.status_code == 200
        assert b'Learner One' in board_response.data
        assert b'>120</td>' in board_response.data
        public_profile_response = client.get(
            f"/users/{database.accounts['learner one']['id']}"
        )
        assert public_profile_response.status_code == 200
        assert b'I enjoy puzzles and science.' in public_profile_response.data
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
            'password': 'a-long-example-password',
            'password_confirm': 'a-long-example-password',
        },
    ).status_code == 400
    assert client.post('/account/profile').status_code == 302


def test_profile_updates_reject_invalid_values_and_oversized_bio():
    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        client = app_module.app.test_client()
        client.get('/account/register')
        client.post(
            '/account/register',
            data={
                'csrf_token': csrf_token(client),
                'display_name': 'Profile Learner',
                'password': 'a-long-example-password',
                'password_confirm': 'a-long-example-password',
            },
        )
        client.get('/account')
        long_bio = 'a' * 241
        response = client.post(
            '/account/profile',
            data={
                'csrf_token': csrf_token(client),
                'bio': long_bio,
                'favorite_subject': 'math',
                'learning_goal': 'general',
                'profile_color': 'sage',
            },
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert b'240 characters or fewer' in response.data
        assert database.accounts['profile learner']['bio'] == ''

        response = client.post(
            '/account/profile',
            data={
                'csrf_token': csrf_token(client),
                'bio': '',
                'favorite_subject': 'unapproved-value',
                'learning_goal': 'general',
                'profile_color': 'sage',
            },
            follow_redirects=True,
        )
        assert b'Choose a valid favorite subject.' in response.data


def test_leaderboard_score_requires_login_csrf_and_valid_game():
    anonymous = app_module.app.test_client()
    assert anonymous.post(
        '/api/leaderboards/scores',
        data={'game_key': 'math-blast', 'score': 10},
    ).status_code == 302

    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        client = app_module.app.test_client()
        client.get('/account/register')
        client.post(
            '/account/register',
            data={
                'csrf_token': csrf_token(client),
                'display_name': 'Board Tester',
                'password': 'a-long-example-password',
                'password_confirm': 'a-long-example-password',
            },
        )
        client.get('/account')
        token = csrf_token(client)
        assert client.post(
            '/api/leaderboards/scores',
            data={'game_key': 'not-a-game', 'score': 10, 'csrf_token': token},
        ).status_code == 400
        assert client.post(
            '/api/leaderboards/scores',
            data={'game_key': 'math-blast', 'score': 10, 'csrf_token': 'bad-token'},
        ).status_code == 400
        for score in (10, 8):
            response = client.post(
                '/api/leaderboards/scores',
                data={'game_key': 'math-blast', 'score': score, 'csrf_token': token},
            )
            assert response.status_code == 200
        assert len(database.scores) == 1
        assert database.scores[0]['score'] == 10
        assert database.accounts['board tester']['coin_balance'] == 30


def test_public_profiles_are_opt_in_and_require_login():
    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        owner = app_module.app.test_client()
        owner.get('/account/register')
        owner.post(
            '/account/register',
            data={
                'csrf_token': csrf_token(owner),
                'display_name': 'Private Learner',
                'password': 'a-long-example-password',
                'password_confirm': 'a-long-example-password',
            },
        )
        owner.get('/account')
        owner_id = database.accounts['private learner']['id']
        assert not database.accounts['private learner']['profile_public']
        assert owner.get(f'/users/{owner_id}').status_code == 404

        other_learner = app_module.app.test_client()
        other_learner.get('/account/register')
        other_learner.post(
            '/account/register',
            data={
                'csrf_token': csrf_token(other_learner),
                'display_name': 'Another Learner',
                'password': 'a-long-example-password',
                'password_confirm': 'a-long-example-password',
            },
        )
        owner.post(
            '/account/profile',
            data={
                'csrf_token': csrf_token(owner),
                'bio': 'I like learning.',
                'favorite_subject': 'math',
                'learning_goal': 'general',
                'profile_color': 'sage',
                'profile_public': 'yes',
            },
        )
        owner_community = owner.get('/community')
        assert owner_community.status_code == 200
        assert b'Private Learner' in owner_community.data

        response = other_learner.get(f'/users/{owner_id}')
        assert response.status_code == 200
        assert b'Private Learner' in response.data
        assert b'I like learning.' in response.data
        assert b'last_login_at' not in response.data
        community = other_learner.get('/community')
        assert community.status_code == 200
        assert b'Private Learner' in community.data
        assert b'I like learning.' in community.data

        anonymous = app_module.app.test_client()
        assert anonymous.get(f'/users/{owner_id}').status_code == 302


def test_signup_rejects_duplicate_names_case_insensitively():
    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        for name in ('Learner One', 'LEARNER ONE'):
            client = app_module.app.test_client()
            client.get('/account/register')
            response = client.post(
                '/account/register',
                data={
                    'csrf_token': csrf_token(client),
                    'display_name': name,
                    'password': 'a-long-example-password',
                    'password_confirm': 'a-long-example-password',
                },
            )
        assert response.status_code == 200
        assert b'already in use' in response.data


def test_signup_rejects_profanity_obfuscation_and_disallowed_characters():
    for name in ('badword fuck', 'f.u.c.k', 'sh1t', 'name<script>'):
        client = app_module.app.test_client()
        client.get('/account/register')
        response = client.post(
            '/account/register',
            data={
                'csrf_token': csrf_token(client),
                'display_name': name,
                'password': 'a-long-example-password',
                'password_confirm': 'a-long-example-password',
            },
        )
        assert response.status_code == 200
        assert b'Please choose a respectful name' in response.data or (
            b'Names may use letters' in response.data
        )


def test_signup_accepts_respectful_names():
    for name in ('Learner One', "O'Neil", 'Mia-Rose', 'Zoë'):
        assert app_module.username_is_appropriate(name)


def test_signup_rejects_password_confirmation_mismatch():
    client = app_module.app.test_client()
    client.get('/account/register')

    response = client.post(
        '/account/register',
        data={
            'csrf_token': csrf_token(client),
            'display_name': 'Learner One',
            'password': 'a-long-example-password',
            'password_confirm': 'a-different-example-password',
        },
    )

    assert response.status_code == 200
    assert b'The passwords do not match.' in response.data


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


def register_test_account(client, name='Wallet Learner'):
    client.get('/account/register')
    response = client.post(
        '/account/register',
        data={
            'csrf_token': csrf_token(client),
            'display_name': name,
            'password': 'a-long-example-password',
            'password_confirm': 'a-long-example-password',
        },
    )
    client.get('/account')
    return response


def test_signup_and_daily_login_coin_bonuses_are_once_per_day():
    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        client = app_module.app.test_client()
        response = register_test_account(client)
        assert response.status_code == 302
        account = database.accounts['wallet learner']
        assert account['coin_balance'] == app_module.SIGNUP_COIN_BONUS

        client.post('/account/logout', data={'csrf_token': csrf_token(client)})
        account['last_daily_bonus_date'] -= timedelta(days=1)
        client.get('/account/login')
        response = client.post(
            '/account/login',
            data={
                'csrf_token': csrf_token(client),
                'login_name': 'Wallet Learner',
                'password': 'a-long-example-password',
            },
            follow_redirects=True,
        )
        assert response.status_code == 200
        assert b'daily login coins' in response.data
        assert account['coin_balance'] == (
            app_module.SIGNUP_COIN_BONUS + app_module.DAILY_LOGIN_COIN_BONUS
        )

        client.post('/account/logout', data={'csrf_token': csrf_token(client)})
        client.get('/account/login')
        client.post(
            '/account/login',
            data={
                'csrf_token': csrf_token(client),
                'login_name': 'Wallet Learner',
                'password': 'a-long-example-password',
            },
        )
        assert account['coin_balance'] == (
            app_module.SIGNUP_COIN_BONUS + app_module.DAILY_LOGIN_COIN_BONUS
        )


def test_character_port_purchases_and_equipment_use_the_account_wallet():
    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        client = app_module.app.test_client()
        register_test_account(client)
        token = csrf_token(client)

        pet_port = client.get('/pet-land')
        assert pet_port.status_code == 200
        assert b'Aurora Suit Color' in pet_port.data
        assert b'Crystal Explorer Skin' in pet_port.data
        assert b'Moon Boots' in pet_port.data

        inventory = client.get('/api/account/character')
        assert inventory.status_code == 200
        assert inventory.json['coins'] == app_module.SIGNUP_COIN_BONUS
        assert set(inventory.json['owned']['character']) == {
            'nova-cadet', 'rover-scout', 'alien-explorer',
        }
        assert client.get('/api/account/coins').json['coin_balance'] == (
            app_module.SIGNUP_COIN_BONUS
        )

        purchase = client.post(
            '/api/account/character/action',
            data={
                'csrf_token': token,
                'item_type': 'gear',
                'item_key': 'crystal-skin',
                'action': 'buy',
            },
        )
        assert purchase.status_code == 200
        assert purchase.json['coins'] == app_module.SIGNUP_COIN_BONUS - 12
        assert purchase.json['equipped']['gear']['character:skin'] == 'crystal-skin'

        too_expensive = client.post(
            '/api/account/character/action',
            data={
                'csrf_token': token,
                'item_type': 'gear',
                'item_key': 'cosmic-crown',
                'action': 'buy',
            },
        )
        assert too_expensive.status_code == 400
        assert database.accounts['wallet learner']['coin_balance'] == 13

        unequip = client.post(
            '/api/account/character/action',
            data={
                'csrf_token': token,
                'item_type': 'gear',
                'item_key': 'crystal-skin',
                'action': 'unequip',
            },
        )
        assert unequip.status_code == 200
        assert 'character:skin' not in unequip.json['equipped']['gear']


def test_quest_coins_and_unit_unlocks_are_idempotent_and_csrf_protected():
    database = FakeDatabase()
    with patch.object(
        app_module,
        'get_db_connection',
        side_effect=lambda: FakeConnection(database),
    ):
        client = app_module.app.test_client()
        register_test_account(client)
        token = csrf_token(client)

        topic_reward = {
            'csrf_token': token,
            'topic_id': '1_1',
        }
        first_reward = client.post('/api/account/coins/quest-topic', data=topic_reward)
        duplicate_reward = client.post('/api/account/coins/quest-topic', data=topic_reward)
        assert first_reward.json['coins_awarded'] == 10
        assert duplicate_reward.json['coins_awarded'] == 0
        assert duplicate_reward.json['coin_balance'] == app_module.SIGNUP_COIN_BONUS + 10

        unit_unlock = {
            'csrf_token': token,
            'unit_id': 2,
        }
        first_unlock = client.post('/api/account/coins/unit-unlock', data=unit_unlock)
        duplicate_unlock = client.post('/api/account/coins/unit-unlock', data=unit_unlock)
        assert first_unlock.json['coins_spent'] == app_module.QUEST_UNIT_UNLOCK_COST
        assert duplicate_unlock.json['coins_spent'] == 0
        assert duplicate_unlock.json['coin_balance'] == (
            app_module.SIGNUP_COIN_BONUS + 10 - app_module.QUEST_UNIT_UNLOCK_COST
        )
        assert client.post('/api/account/coins/quest-topic', data={
            'csrf_token': 'bad-token',
            'topic_id': '1_2',
        }).status_code == 400
