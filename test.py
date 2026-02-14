from elevenlabs.client import ElevenLabs

client = ElevenLabs(api_key="your_api_key")

with client.text_to_speech.with_raw_response.convert(
    text="Hello, world!",
    voice_id="voice_id"
) as response:
    # headers
    char_cost = response.headers.get("x-character-count")
    request_id = response.headers.get("request-id")

    # audio bytes
    audio_data = response.data

print("x-character-count:", char_cost)
print("request-id:", request_id)

# optional: save to a file
with open("output.mp3", "wb") as f:
    f.write(audio_data)
