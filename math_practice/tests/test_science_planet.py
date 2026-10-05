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


def test_science_simulation_is_not_listed_as_a_math_game():
    client = app.test_client()

    response = client.get('/math-games')

    assert response.status_code == 200
    assert b'Science Planet' in response.data
    assert b'Natural Selection Planet' not in response.data
