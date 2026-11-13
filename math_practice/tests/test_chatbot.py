import io
import json
from unittest.mock import patch

import app as app_module


def test_faq_matches_relevant_site_help_without_generic_keyword_collisions():
    assert 'Pet Planet' in app_module.get_faq_response('How do I find the link to Pet Planet?')
    assert 'Station 11' in app_module.get_faq_response('Where is football?')
    assert app_module.get_faq_response('Can you help me simplify 1/2 plus 1/3?') is None
    assert app_module.get_faq_response('How do I join a game?') is None
    assert 'calendar' in app_module.get_faq_response('When is spring break?').lower()
    assert 'vary' in app_module.get_faq_response('When is my due date?')


def test_gemini_preserves_complete_multiline_reply():
    result = {'candidates': [{'finishReason': 'STOP', 'content': {'parts': [
        {'text': 'Private reasoning', 'thought': True},
        {'text': 'First step.\nSecond step.'},
        {'text': 'Try it yourself.'},
    ]}}]}
    with patch.dict(app_module.os.environ, {'GEMINI_API_KEY': 'test-key'}), \
            patch.object(app_module.urllib_request, 'urlopen', return_value=io.BytesIO(json.dumps(result).encode())) as urlopen:
        answer = app_module.generate_gemini_reply('How?', '/quest-map', [])

    payload = json.loads(urlopen.call_args.args[0].data)
    assert answer == 'First step.\nSecond step.\nTry it yourself.'
    assert payload['generationConfig']['maxOutputTokens'] > 220
    assert 'Current page: /quest-map' in payload['contents'][-1]['parts'][0]['text']


def test_incomplete_gemini_reply_is_not_presented_as_complete():
    result = {'candidates': [{'finishReason': 'MAX_TOKENS', 'content': {'parts': [{'text': 'Incomplete'}]}}]}
    client = app_module.app.test_client()
    with patch.dict(app_module.os.environ, {'GEMINI_API_KEY': 'test-key'}), \
            patch.object(app_module.urllib_request, 'urlopen', return_value=io.BytesIO(json.dumps(result).encode())):
        response = client.post('/ask-chatbot', json={'message': 'How can I solve this?'})

    assert response.status_code == 200
    assert response.json['source'] == 'incomplete'
    assert 'cut off' in response.json['answer']
    assert 'Incomplete' not in response.json['answer']


def test_chatbot_reports_provider_failure_and_uses_relevant_offline_help():
    client = app_module.app.test_client()
    with patch.object(app_module, 'generate_gemini_reply', side_effect=RuntimeError('offline')):
        known = client.post('/ask-chatbot', json={'message': 'Where is Pet Planet?'})
        unknown = client.post('/ask-chatbot', json={'message': 'Can you help me add fractions?'})

    assert known.json['source'] == 'faq-fallback'
    assert 'Pet Planet' in known.json['answer']
    assert unknown.json['source'] == 'fallback'
    assert "couldn't connect" in unknown.json['answer']
