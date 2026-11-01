import os
import asyncio
import subprocess
import edge_tts

VOICE = "en-US-AndrewMultilingualNeural"

# Target: ~3 minutes (197.0s = 5910 frames at 30 fps)
# Every scene has clean positive headroom.
SCENES = [
    {
        "id": "scene_01_hook",
        "duration_sec": 23.0,
        "text": "Every year, millions of people walk into bespoke tailors or message custom makers carrying an AI render or a Pinterest photo. They say: make me this. Weeks later, the garment arrives looking completely different. The waist pulls, the drape collapses, and the fabric behaves unexpectedly. Why? Because pixels are not patterns."
    },
    {
        "id": "scene_02_contrast",
        "duration_sec": 16.0,
        "text": "Most virtual try-on tools stop at a flat digital image. It is a fun visual novelty, but a 2D JPEG tells a tailor nothing about fabric weight, chest ease, or workshop feasibility. You cannot cut silk or wool from pixels alone."
    },
    {
        "id": "scene_03_pitch",
        "duration_sec": 23.0,
        "text": "Introducing MakerBrief. Built for the YouCam API Hackathon, MakerBrief bridges personal try-on and physical tailoring. We connect buyer preferences to personal virtual try-on, human master-tailor reviews, itemized quotes, and exact-version agreements. We make the boundary between digital preview and physical craft explicit."
    },
    {
        "id": "scene_04_buyer_studio",
        "duration_sec": 29.0,
        "text": "Here is the Buyer Studio. The client enters their measurements, uploads their photo, and selects an outer jacket. When requesting a preview, MakerBrief calls the YouCam Clothes V4 server to server API. The engine detects pose and garment boundaries, returning an authentic high-resolution try-on result. Rather than pretending this image is production ready, MakerBrief packages it directly into an actionable commission brief."
    },
    {
        "id": "scene_05_maker_desk",
        "duration_sec": 29.0,
        "text": "Now we switch to the Maker Desk using authenticated tailor access. An experienced tailor inspects the YouCam preview against the client's actual measurements. Using our Discrepancy Tracker, the tailor notes physical constraints, such as pocket placement and pattern ease. Once verified, the maker issues an itemized quote of 1,450 dollars with a 4-week timeline. The buyer reviews every detail and signs the agreement."
    },
    {
        "id": "scene_06_revision_invalidation",
        "duration_sec": 31.0,
        "text": "Here is the core breakthrough of MakerBrief. In bespoke tailoring, clients frequently change their minds. When the buyer changes the material from lightweight silk to 380gsm boiled wool, MakerBrief instantly flags the previous quote as outdated with an amber alert. It prevents surprise bills by showing both parties the exact reason for invalidation. The tailor issues an updated quote of 1,620 dollars, and both sides re-approve."
    },
    {
        "id": "scene_07_architecture",
        "duration_sec": 25.0,
        "text": "MakerBrief is engineered with extreme care. It runs on a zero-dependency native Node.js architecture with strict input validation. Our YouCam adapter communicates directly with Perfect Corp's Clothes V4 endpoint with durable polling. Every state transition is guarded by a deterministic domain engine, verified by 16 out of 16 passing automated tests."
    },
    {
        "id": "scene_08_close",
        "duration_sec": 21.0,
        "text": "Once approved, MakerBrief generates a clean, printable atelier specification ready for the workshop cutting table, complete with pattern notes and cryptographic session locks. MakerBrief transforms YouCam's virtual try-on from a consumer novelty into the foundation of custom manufacturing. Thank you."
    }
]

async def generate_scene_audio(scene, out_dir):
    filename = os.path.join(out_dir, f"{scene['id']}.mp3")
    # Only generate if missing or re-synthesize
    communicate = edge_tts.Communicate(scene['text'], VOICE, rate="+8%", pitch="+0Hz")
    await communicate.save(filename)
    
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", filename
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    actual_dur = float(res.stdout.strip())
    headroom = scene['duration_sec'] - actual_dur
    status = "OK" if headroom >= 0 else "OVERFLOW"
    print(f"  {scene['id']}: actual={actual_dur:.2f}s, allocated={scene['duration_sec']:.2f}s, headroom={headroom:+.2f}s [{status}]")
    return filename, actual_dur

async def main():
    voiceover_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "voiceover"))
    os.makedirs(voiceover_dir, exist_ok=True)
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public"))
    os.makedirs(public_dir, exist_ok=True)

    durations = []
    offsets = []
    current_offset = 0.0

    print("Generating and verifying speech audio segments...")
    for scene in SCENES:
        offsets.append(current_offset)
        fn, dur = await generate_scene_audio(scene, voiceover_dir)
        durations.append(dur)
        current_offset += scene['duration_sec']

    total_video_dur = current_offset
    print(f"\nTotal video duration: {total_video_dur:.2f}s ({int(total_video_dur * 30)} frames)")

    filter_parts = []
    inputs = []
    for i, (scene, offset) in enumerate(zip(SCENES, offsets)):
        audio_file = os.path.join(voiceover_dir, f"{scene['id']}.mp3")
        inputs.extend(["-i", audio_file])
        delay_ms = int((offset + 0.4) * 1000)
        filter_parts.append(f"[{i}]adelay={delay_ms}|{delay_ms}[d{i}]")

    mix_inputs = "".join(f"[d{i}]" for i in range(len(SCENES)))
    filter_parts.append(f"{mix_inputs}amix=inputs={len(SCENES)}:duration=longest:dropout_transition=0[out]")
    filter_str = ";".join(filter_parts)

    master_audio = os.path.join(public_dir, "master_voiceover.mp3")
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_str,
        "-map", "[out]",
        "-c:a", "libmp3lame", "-b:a", "192k",
        master_audio
    ]
    print("\nMixing master audio track...")
    subprocess.run(cmd, check=True)
    print(f"Master voiceover written to: {master_audio}")

if __name__ == '__main__':
    asyncio.run(main())
