from html.parser import HTMLParser
from unittest.mock import MagicMock, patch

from app import app


def test_science_activities_are_listed_on_one_planet():
    client = app.test_client()

    response = client.get('/earth-science-planet')

    assert response.status_code == 200
    assert b'Beetle Natural Selection' in response.data
    assert b'Moth Camouflage' in response.data
    assert b'ELA' in response.data
    assert b'Math' in response.data


def test_beetle_natural_selection_includes_timed_collection():
    client = app.test_client()

    response = client.get('/natural-selection-planet')

    assert response.status_code == 200
    assert b'Timed beetle hunt' in response.data
    assert b'id="startBeetleHunt"' in response.data
    assert b'id="beetlesCollected"' in response.data
    assert b'id="beetleHuntTime"' in response.data
    assert b'Every five seconds' in response.data
    assert b'huntElapsedSeconds % 5 === 0' in response.data
    assert b'window.requestAnimationFrame(animateHunt)' in response.data


def test_moth_camouflage_game_loads():
    client = app.test_client()

    response = client.get('/moth-camouflage')

    assert response.status_code == 200
    assert b'Peppered moth population' in response.data
    assert b'Lichen-covered' in response.data
    assert b'Soot-darkened' in response.data
    assert b'Next generation' in response.data


def test_moth_camouflage_includes_timed_collection_controls():
    client = app.test_client()

    response = client.get('/moth-camouflage')

    assert response.status_code == 200
    assert b'Timed moth hunt' in response.data
    assert b'id="startHunt"' in response.data
    assert b'id="collectedCount"' in response.data
    assert b'id="huntTime"' in response.data
    assert b'30-second timer' in response.data
    assert b'Every five seconds' in response.data
    assert b'window.requestAnimationFrame(animateHuntFrame)' in response.data
    assert b'huntElapsedSeconds % 5 === 0' in response.data


def test_quest_map_has_one_science_planet_and_all_subjects():
    client = app.test_client()

    response = client.get('/quest-map')

    assert response.status_code == 200
    assert b'ELA Planet' in response.data
    assert b'Math Games Planet' in response.data
    assert b'Science Planet' in response.data
    assert b'Natural Selection Planet' not in response.data


def test_planet_polus_is_accessible_from_quest_map():
    client = app.test_client()
    response = client.get('/planet-polus')
    assert response.status_code == 200
    assert b'Suit Up' in response.data
    assert b'Emergency Meeting' in response.data
    assert b'planet_polus.js' in response.data
    quest_map = client.get('/quest-map')
    assert b'Planet Polus' in quest_map.data
    assert b'/planet-polus' in quest_map.data


def test_planet_polus_exposes_customization_and_character_actions():
    response = app.test_client().get('/planet-polus')
    assert response.status_code == 200
    for control in (b'crew-edit', b'crew-body', b'crew-face', b'crew-visor', b'crew-mouth',
                    b'crew-eyes', b'crew-glasses', b'crew-shirt',
                    b'crew-bottoms', b'crew-shoes'):
        assert b'id="' + control + b'"' in response.data
    for action in (b'wave', b'dance', b'cheer', b'rest'):
        assert b'data-action="' + action + b'"' in response.data


def test_golden_algebra_planet_is_accessible_from_quest_map():
    client = app.test_client()

    response = client.get('/golden-algebra')
    assert response.status_code == 200
    assert b'Operation: Golden Algebra' in response.data
    assert b'golden_algebra.js' in response.data
    quest_map = client.get('/quest-map')
    assert b'Golden Algebra Planet' in quest_map.data
    assert b'/golden-algebra' in quest_map.data


def test_golden_algebra_starts_each_stage_with_one_visible_checkpoint():
    class Checkpoints(HTMLParser):
        def __init__(self):
            super().__init__()
            self.stage = None
            self.nodes = {}

        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag == 'form' and 'code-form' in attrs.get('class', '').split():
                self.stage = attrs['data-stage']
                self.nodes[self.stage] = []
            if self.stage and tag == 'div' and 'node' in attrs.get('class', '').split():
                self.nodes[self.stage].append('hidden' in attrs)

        def handle_endtag(self, tag):
            if tag == 'form':
                self.stage = None

    parser = Checkpoints()
    parser.feed(app.test_client().get('/golden-algebra').get_data(as_text=True))
    assert parser.nodes == {'1': [False, True, True], '2': [False, True, True], '3': [False]}


def test_golden_algebra_mainframe_questions_require_simplification():
    client = app.test_client()

    page = client.get('/golden-algebra')
    script = client.get('/static/js/golden_algebra.js')

    assert b'Simplify <code>3x+2x-4</code> by combining like terms.' in page.data
    assert b'Simplify <code>(12x+6)/3</code> by dividing each term by 3.' in page.data
    assert b"'firewall-2': { pattern: /^5x-4$/" in script.data
    assert b"'firewall-3': { pattern: /^(4x\\+2|2\\+4x)$/" in script.data
    assert b"-(4x\\+2|2\\+4x)$/" in script.data


def test_golden_algebra_shows_recovered_codes_at_the_master_vault():
    client = app.test_client()

    page = client.get('/golden-algebra')
    script = client.get('/static/js/golden_algebra.js')

    assert b'id="vault-code-reference"' in page.data
    assert b' id="vault-code-reference" class="code-reference" aria-labelledby="vault-code-title" hidden' in page.data
    assert b'<code>2x+10</code>' in page.data
    assert b'<code>5x-4</code>' in page.data
    assert b'<code>4x+2</code>' in page.data
    assert b"document.getElementById('vault-code-reference').hidden = stages[index] !== 'master-vault';" in script.data


def test_golden_algebra_live_roster_is_private_and_student_presence_is_recorded():
    client = app.test_client()
    page = client.get('/golden-algebra')
    assert b'Agents playing now' not in page.data
    assert b'data-presence-endpoint="/api/golden-algebra/presence"' in page.data
    with client.session_transaction() as state:
        csrf = state['csrf_token']

    connection = MagicMock()
    cursor = connection.cursor.return_value.__enter__.return_value
    cursor.fetchall.return_value = [('Alex M.',), ('Riley C.',)]
    with patch('app.get_db_connection', return_value=connection):
        roster = client.get('/api/golden-algebra/presence')
        response = client.post('/api/golden-algebra/presence', data={
            'csrf_token': csrf,
            'display_name': 'Alex M.',
            'current_stage': 'outer-door',
            'total_attempts': '0',
            'correct_answers': '0',
            'mission_completed': 'false',
        })

    assert roster.status_code == 403
    assert response.status_code == 200
    assert response.get_json() == {'ok': True}
    assert response.headers['Cache-Control'] == 'no-store'
    assert any('ON CONFLICT (presence_id)' in call.args[0] for call in cursor.execute.call_args_list)
    assert not any('SELECT display_name' in call.args[0] for call in cursor.execute.call_args_list)

    teacher = app.test_client()
    with teacher.session_transaction() as state:
        state['account_id'] = 42
    with patch('app.get_db_connection', return_value=connection), \
            patch.dict('app.os.environ', {'TEACHER_ACCOUNT_ID': '42'}):
        assert b'Agents playing now' in teacher.get('/golden-algebra').data
        with teacher.session_transaction() as state:
            teacher_csrf = state['csrf_token']
        roster = teacher.get('/api/golden-algebra/presence')
        teacher_update = teacher.post('/api/golden-algebra/presence', data={
            'csrf_token': teacher_csrf,
            'display_name': 'Alex M.',
            'current_stage': 'outer-door',
            'total_attempts': '0',
            'correct_answers': '0',
            'mission_completed': 'false',
        })
    assert roster.status_code == 200
    assert roster.get_json() == {'players': [{'name': 'Alex M.'}, {'name': 'Riley C.'}]}
    assert roster.headers['Cache-Control'] == 'no-store'
    assert teacher_update.get_json() == roster.get_json()


def test_golden_algebra_presence_rejects_invalid_names_and_csrf():
    client = app.test_client()
    with client.session_transaction() as state:
        state['csrf_token'] = 'valid-token'

    with patch('app.get_db_connection') as get_db_connection:
        invalid_csrf = client.post('/api/golden-algebra/presence', data={
            'csrf_token': 'wrong-token',
            'display_name': 'Alex M.',
        })
        invalid_name = client.post('/api/golden-algebra/presence', data={
            'csrf_token': 'valid-token',
            'display_name': '<script>alert(1)</script>',
        })

    assert invalid_csrf.status_code == 400
    assert invalid_name.status_code == 400
    get_db_connection.assert_not_called()


def test_golden_algebra_stats_spreadsheet_is_teacher_only():
    from datetime import datetime, timezone

    client = app.test_client()
    with client.session_transaction() as state:
        state['account_id'] = 42
    connection = MagicMock()
    cursor = connection.cursor.return_value.__enter__.return_value
    cursor.fetchall.return_value = [(
        'Alex M.', 'mainframe', 3, 5, False,
        datetime(2026, 11, 18, 16, 0, tzinfo=timezone.utc),
        datetime(2026, 11, 18, 16, 5, tzinfo=timezone.utc),
        None,
    )]
    with patch('app.get_db_connection', return_value=connection), \
            patch.dict('app.os.environ', {'TEACHER_ACCOUNT_ID': '42'}):
        page = client.get('/golden-algebra')
        response = client.get('/golden-algebra/stats.csv')
        legacy_response = client.get('/teacher/golden-algebra/stats.csv')

    assert b'Download active player stats (.csv)' in page.data
    assert b'href="/golden-algebra/stats.csv"' in page.data
    assert b'The teacher can see your name and game stats' in page.data
    assert response.status_code == 200
    assert legacy_response.status_code == 200
    assert response.mimetype == 'text/csv'
    assert response.headers['Content-Disposition'].endswith(
        'filename="golden-algebra-active-player-stats.csv"'
    )
    assert b'Student,Current stage,Checkpoints completed (of 7)' in response.data
    assert b'Alex M.,Mainframe bypass,3/7,5,60%,In progress' in response.data

    visitor = app.test_client()
    with visitor.session_transaction() as state:
        state['account_id'] = 77
    anonymous = app.test_client()
    with patch('app.get_db_connection') as get_db_connection, \
            patch.dict('app.os.environ', {'TEACHER_ACCOUNT_ID': '42'}):
        for non_teacher in (anonymous, visitor):
            page = non_teacher.get('/golden-algebra')
            assert b'Agents playing now' not in page.data
            assert b'Download active player stats (.csv)' not in page.data
            assert non_teacher.get('/api/golden-algebra/presence').status_code == 403
            expected_status = 302 if non_teacher is anonymous else 403
            assert non_teacher.get('/golden-algebra/stats.csv').status_code == expected_status
            assert non_teacher.get('/teacher/golden-algebra/stats.csv').status_code == expected_status
        get_db_connection.assert_not_called()


def test_fable_quest_planet_is_accessible_from_quest_map():
    client = app.test_client()
    response = client.get('/fable-quest')
    assert response.status_code == 200
    assert b'Fable Quest' in response.data
    assert b'fable_engine.js' in response.data
    assert b'fable_quest.js' in response.data
    quest_map = client.get('/quest-map')
    assert b'Fable Quest Planet' in quest_map.data
    assert b'/fable-quest' in quest_map.data


def test_starlight_maze_is_accessible_from_game_planet():
    client = app.test_client()
    game = client.get('/starlight-maze')
    assert game.status_code == 200
    assert b'Starlight Maze' in game.data
    assert b'starlight_maze_engine.js' in game.data
    hub = client.get('/game-planet')
    assert hub.status_code == 200
    assert b'Starlight Maze' in hub.data
    assert b'/starlight-maze' in hub.data


def test_science_simulation_is_not_listed_as_a_math_game():
    client = app.test_client()

    response = client.get('/math-games')

    assert response.status_code == 200
    assert b'Science Planet' in response.data
    assert b'Natural Selection Planet' not in response.data
