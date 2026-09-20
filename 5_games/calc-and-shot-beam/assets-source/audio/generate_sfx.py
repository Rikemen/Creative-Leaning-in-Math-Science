"""標準ライブラリだけで再生成できるオリジナル効果音。画像処理は行わない。"""
import json
import hashlib
import math
import random
import struct
import wave
from pathlib import Path

RATE = 44100
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/assets/audio'
TAU = math.tau


def bell(t, frequency, duration):
    if t < 0 or t >= duration:
        return 0.0
    envelope = min(1, t / 0.008) * math.exp(-6 * t / duration)
    envelope *= min(1, (duration - t) / 0.025)
    return envelope * (math.sin(TAU * frequency * t) + 0.18 * math.sin(TAU * frequency * 2 * t))


def write(name, duration, sampler, gain, loop=False):
    samples = [sampler(i / RATE) for i in range(round(duration * RATE))]
    peak = max(abs(value) for value in samples) or 1
    values = [round(value / peak * gain * 32767) for value in samples]
    path = OUT / (name + '-v1.wav')
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(struct.pack('<' + 'h' * len(values), *values))
    return {'id': name, 'file': path.name, 'durationSeconds': duration, 'sampleRate': RATE,
            'channels': 1, 'peakDbfs': round(20 * math.log10(gain), 2), 'loop': loop,
            'rmsDbfs': round(20 * math.log10(math.sqrt(sum(v*v for v in values)/len(values))/32767), 2)}


def dbfs(value):
    return round(20 * math.log10(max(value, 1e-12)), 2)


def spectrum(values):
    """Windowed radix-2 FFT for QA; the generator has no third-party dependencies."""
    size = 1
    while size < len(values):
        size *= 2
    bins = [complex(v * (.5 - .5 * math.cos(TAU*i/(len(values)-1))))
            for i, v in enumerate(values)] + [0j] * (size-len(values))
    j = 0
    for i in range(1, size):
        bit = size >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j ^= bit
        if i < j:
            bins[i], bins[j] = bins[j], bins[i]
    length = 2
    while length <= size:
        turn = complex(math.cos(-TAU/length), math.sin(-TAU/length))
        for offset in range(0, size, length):
            phase = 1 + 0j
            for i in range(length//2):
                a, b = bins[offset+i], bins[offset+i+length//2] * phase
                bins[offset+i], bins[offset+i+length//2] = a+b, a-b
                phase *= turn
        length *= 2
    power = [abs(value)**2 for value in bins[:size//2+1]]
    total = sum(power)
    return {label: round(sum(p for i, p in enumerate(power) if predicate(i*RATE/size))/total, 8)
            for label, predicate in {
                'below60HzEnergyRatio': lambda hz: hz < 60,
                'above5000HzEnergyRatio': lambda hz: hz > 5000,
                'above8000HzEnergyRatio': lambda hz: hz > 8000,
            }.items()}


def write_v2(name, duration, sampler, gain, loop=False):
    samples = [sampler(i/RATE) for i in range(round(duration*RATE))]
    peak = max(abs(value) for value in samples)
    values = [round(value/peak*gain*32767) for value in samples]
    path = OUT / (name + '-v2.wav')
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(struct.pack('<'+'h'*len(values), *values))
    # Decode the artifact itself, not just the floating-point synthesis buffer.
    with wave.open(str(path), 'rb') as source:
        values = struct.unpack('<'+'h'*source.getnframes(), source.readframes(source.getnframes()))
        decoded = [value/32768 for value in values]
        report = {'id': name, 'file': path.name, 'durationSeconds': source.getnframes()/source.getframerate(),
                  'frames': source.getnframes(), 'sampleRate': source.getframerate(),
                  'channels': source.getnchannels(), 'bitsPerSample': source.getsampwidth()*8, 'loop': loop}
    rms = lambda segment: math.sqrt(sum(value*value for value in segment)/len(segment))
    report.update({'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                   'peakDbfs': dbfs(max(abs(value) for value in decoded)),
                   'rmsDbfs': dbfs(rms(decoded)), 'dcOffset': sum(decoded)/len(decoded),
                   'clippedSamples': sum(value <= -32768 or value >= 32767 for value in values),
                   'firstSample': decoded[0], 'lastSample': decoded[-1],
                   'joinDifference': abs(decoded[0]-decoded[-1]),
                   'maxInteriorStep': max(abs(a-b) for a, b in zip(decoded, decoded[1:])),
                   'first50msRmsDbfs': dbfs(rms(decoded[:RATE//20])),
                   'last50msRmsDbfs': dbfs(rms(decoded[-RATE//20:])),
                   **spectrum(decoded)})
    assert report['clippedSamples'] == 0 and report['peakDbfs'] <= -6
    assert report['below60HzEnergyRatio'] < .025
    assert report['above5000HzEnergyRatio'] < .01
    if loop:
        report['continuousEndpointError'] = abs(sampler(duration)-sampler(0))
        report['joinStepWithinInteriorMaximum'] = report['joinDifference'] <= report['maxInteriorStep']
        # Constant carrier energy at the seam: no end fades or periodic silent hole.
        report['seamRmsDifferenceDb'] = round(abs(report['first50msRmsDbfs']-report['last50msRmsDbfs']), 2)
        assert report['continuousEndpointError'] < 1e-9
        assert report['joinStepWithinInteriorMaximum'] and report['seamRmsDifferenceDb'] < 3
    else:
        assert values[0] == values[-1] == 0
    return report


def beam_v2():
    """Original laser DSP: a short launch burst plus a seamless periodic sustain."""
    duration = 1.6
    rng = random.Random(20260916)
    # Every frequency and modulation completes integer cycles in 1.6 seconds.
    # Periodic band-limited texture avoids a repeated white-noise splice.
    texture = [(rng.randrange(640, 4481)/duration, rng.uniform(0, TAU),
                rng.uniform(.018, .045)) for _ in range(32)]

    def sustain(t):
        pulse = .78 + .14*math.cos(TAU*5*t) + .06*math.cos(TAU*10*t)
        body = .63*math.sin(TAU*120*t) + .30*math.sin(TAU*240*t+.3)
        core = .36*math.sin(TAU*480*t + .85*math.sin(TAU*120*t))
        halo = .18*math.sin(TAU*960*t + .40*math.sin(TAU*60*t))
        shimmer = sum(amplitude*math.sin(TAU*hz*t+phase) for hz, phase, amplitude in texture)
        return pulse*(body+core+halo) + .28*shimmer*(.85+.15*math.cos(TAU*2.5*t))

    fire_duration = .44
    count = round(fire_duration*RATE)
    fast = slow = fast2 = slow2 = 0.0
    noise = []
    # Cascaded low-pass filters retain the impact band but soften the top octave.
    a_fast, a_slow = 1-math.exp(-TAU*2600/RATE), 1-math.exp(-TAU*250/RATE)
    for _ in range(count):
        raw = rng.uniform(-1, 1)
        fast += a_fast*(raw-fast)
        slow += a_slow*(raw-slow)
        fast2 += a_fast*(fast-fast2)
        slow2 += a_slow*(slow-slow2)
        noise.append(fast2-slow2)

    def fire(t):
        if not 0 <= t < fire_duration:
            return 0
        attack = .5-.5*math.cos(math.pi*min(1, t/.006))
        release = .5-.5*math.cos(math.pi*min(1, (fire_duration-t)/.060))
        phase = TAU*(420*t + (1800-420)*.045*(1-math.exp(-t/.045)))
        bass_phase = TAU*(90*t + (180-90)*.035*(1-math.exp(-t/.035)))
        laser = (.65*math.sin(phase)+.13*math.sin(1.98*phase))*math.exp(-t/.105)
        impact = .65*math.sin(bass_phase)*math.exp(-t/.095)
        crackle = .85*noise[min(round(t*RATE), count-1)]*math.exp(-t/.060)
        tail = .17*math.sin(TAU*480*t+.3*math.sin(TAU*60*t))*math.exp(-t/.150)
        return attack*release*(laser+impact+crackle+tail)

    return [write_v2('beam-loop', duration, sustain, .44, loop=True),
            write_v2('beam-fire', fire_duration, fire, .48)]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rng = random.Random(20260909)
    noise = [rng.uniform(-1, 1) for _ in range(RATE)]
    definitions = [
        ('start', 1.0, lambda t: sum(bell(t-i*0.17, f, 0.5) for i, f in enumerate([523.25,659.25,783.99])), .38, False),
        ('beam-loop', 1.0, lambda t: (0.75+.15*math.cos(TAU*4*t)) * (math.sin(TAU*160*t)+.3*math.sin(TAU*320*t)+.1*math.sin(TAU*640*t)), .25, True),
        ('barrier', .48, lambda t: bell(t, 480, .48)+.5*bell(t, 710, .35), .28, False),
        ('break', .65, lambda t: .55*bell(t, 196, .23)+bell(t-.05, 880, .5)+.2*noise[min(int(t*RATE), RATE-1)]*math.exp(-32*t)*min(1,t/.005), .36, False),
        ('finish', 1.35, lambda t: sum(bell(t-i*.2, f, .7) for i, f in enumerate([659.25,783.99,1046.5])), .38, False),
        ('button', .13, lambda t: bell(t, 740, .13), .22, False),
    ]
    report = [write(*item) for item in definitions]
    (Path(__file__).parent / 'sfx-report-v1.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    v2 = {'generator': 'Python standard library; original deterministic DSP; no external audio',
          'files': beam_v2(),
          'legacySha256': {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                           for path in sorted(OUT.glob('*-v1.wav'))}}
    (Path(__file__).parent / 'sfx-report-v2.json').write_text(json.dumps(v2, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(v2, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
