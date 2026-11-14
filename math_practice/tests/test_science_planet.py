from html.parser import HTMLParser

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
