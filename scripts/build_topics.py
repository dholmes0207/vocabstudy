#!/usr/bin/env python3
"""Build public/data/topics/en.json — the "Học theo chủ đề" decks.

Each deck is a hand-checked list of headwords that already exist in
public/data/en.json (docs/design/topics.md, sources in topics-sources.md).
A word may sit in several decks. Words were checked against the pack's own
meaning, e.g. "mouse" is the animal there, so it is not in Tech, and "post" is
the verb, so it is not in Places.

Usage:  python3 scripts/build_topics.py
Fails (and writes nothing) if a headword is missing from the pack.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / 'public' / 'data' / 'en.json'
OUT = ROOT / 'public' / 'data' / 'topics' / 'en.json'

# (id, emoji, (Vietnamese title, English title), headwords)
TOPICS = [
    (
        'work',
        '💼',
        ('Công sở', 'At work'),
        '''
        manager meeting coworker intern internship bonus agenda supplier headquarters
        cubicle photocopier spreadsheet memo resignation layoff startup entrepreneur
        warranty feedback logo
        ''',
    ),
    (
        'jobs',
        '🧑‍🔧',
        ('Nghề nghiệp', 'Jobs'),
        '''
        barber cleaner florist gardener janitor midwife miner nanny paramedic postman
        courier lifeguard locksmith optician teacher doctor nurse farmer chef police
        engineer lawyer pilot waiter waitress dentist artist actor journalist secretary
        soldier firefighter mechanic cashier pharmacist scientist photographer
        ''',
    ),
    (
        'places',
        '🏙️',
        ('Nơi chốn trong thành phố', 'Places in town'),
        '''
        barbershop laundromat salon aquarium cafeteria kindergarten orphanage pier plaza
        warehouse bank hospital library market museum park school station airport restaurant
        pharmacy supermarket office factory temple cinema theater zoo stadium bakery cafe
        shop store gym
        ''',
    ),
    (
        'around-town',
        '🚦',
        ('Đường phố & đi lại', 'Streets & travel'),
        '''
        sidewalk crosswalk intersection roundabout layover runway seatbelt turbulence
        reception checkout coupon aisle trolley basket banknote tenant alley avenue
        boulevard monument sailboat
        ''',
    ),
    (
        'clothes',
        '👕',
        ('Quần áo & phụ kiện', 'Clothes & accessories'),
        '''
        shirt dress shoe hat coat jacket skirt trousers pants jeans sock glove scarf tie
        belt boot sweater uniform cardigan overcoat tuxedo stocking sneaker beanie
        wristwatch handbag lace denim velvet
        ''',
    ),
    (
        'food',
        '🍜',
        ('Ăn uống', 'Food & drink'),
        '''
        rice bread egg milk meat fish chicken fruit apple orange vegetable soup sugar salt
        tea coffee water breakfast lunch dinner cook eat drink noodle beef pork cheese
        butter juice cauliflower celery omelet clam veal yeast crumb pretzel muffin stew
        curry thaw gulp nibble crunch slurp
        ''',
    ),
    (
        'body',
        '🫀',
        ('Cơ thể', 'The body'),
        '''
        head hand eye ear nose mouth arm leg foot heart stomach back shoulder knee finger
        tooth hair face neck lip tongue skin bone blood brain chest thumb toe elbow wrist
        ankle nostril scalp rib liver calf freckle dimple pimple scar
        ''',
    ),
    (
        'health',
        '🩺',
        ('Sức khoẻ & vệ sinh', 'Health & hygiene'),
        '''
        backache earache migraine chills diarrhea dizziness insomnia fatigue checkup
        stethoscope wheelchair crutches stitches swelling fracture diabetes asthma heartbeat
        pulse protein calorie nutrient stretching posture hygiene floss mouthwash
        conditioner deodorant lotion allergy
        ''',
    ),
    (
        'family',
        '👨‍👩‍👧',
        ('Gia đình', 'Family'),
        '''
        family mother father parent brother sister son wife husband baby child children
        grandmother grandfather uncle aunt cousin nephew niece twin marry wedding home
        ''',
    ),
    (
        'home',
        '🏠',
        ('Đồ dùng trong nhà', 'Around the house'),
        '''
        basin bead bookmark bunk cabinet clothespin cork cot crib diaper funnel gutter hose
        leash padlock rag thermos toolbox tweezers wrench zipper dustpan stroller pacifier
        rattle highchair toothpick grater peeler cutlery pitcher coaster placemat tablecloth
        doorknob hinge shutter blinds duvet nightstand dresser
        ''',
    ),
    (
        'school',
        '🎒',
        ('Trường học', 'School'),
        '''
        school teacher student class lesson exam homework book pen pencil notebook library
        test study learn grade subject university college dictionary ruler eraser blackboard
        semester sharpener assignment memorize kindergarten
        ''',
    ),
    (
        'tech',
        '📱',
        ('Công nghệ & mạng xã hội', 'Tech & social media'),
        '''
        computer phone email password website download upload screen keyboard laptop app
        online offline battery charger camera video message account attachment notification
        scanner earbuds speaker microphone backup icon tab podcast playlist subscriber
        follower avatar scroll swipe zoom glitch bug
        ''',
    ),
    (
        'nature',
        '🌿',
        ('Thiên nhiên & thời tiết', 'Nature & weather'),
        '''
        tree flower river mountain sea rain sun wind snow cloud forest weather storm lake
        beach island sky moon star grass leaf stone desert ocean hill valley rainbow thunder
        lightning hail drought typhoon landslide riverbank shrub vine moss fern boulder oak
        orchid rose lily bud petal twig acorn
        ''',
    ),
    (
        'animals',
        '🐾',
        ('Con vật', 'Animals'),
        '''
        dog cat bird fish horse cow pig chicken duck elephant tiger monkey snake bee ant
        butterfly rabbit mouse lion bear sheep goat frog spider whale shark dolphin wolf fox
        deer hive paw claw beak fin hoof antenna cocoon tadpole beaver otter crow hawk
        beetle scorpion
        ''',
    ),
    (
        'time',
        '⏰',
        ('Thời gian', 'Time'),
        '''
        day week month year morning afternoon evening night today tomorrow yesterday hour
        minute second weekend calendar early late midnight century decade season spring
        summer winter afterward someday weekly monthly yearly noon twilight fortnight
        millennium
        ''',
    ),
    (
        'hobbies',
        '🎸',
        ('Âm nhạc, sở thích & thể thao', 'Music, hobbies & sport'),
        '''
        guitar piano violin cello flute trumpet saxophone harp ukulele melody genre
        rehearsal audition karaoke hockey cricket judo camping fishing hunting rowing
        sailing climbing crossword origami knitting sewing embroidery gardening baking
        painting sketching photography calligraphy scoreboard tournament championship
        spectator jersey striker
        ''',
    ),
    (
        'feelings',
        '💭',
        ('Cảm xúc & tính cách', 'Feelings & character'),
        '''
        boredom curiosity despair disappointment disgust embarrassment frustration gratitude
        guilt happiness jealousy loneliness misery nostalgia rage sadness determination
        humility generosity laziness loyalty modesty optimism politeness selfishness
        stubbornness creativity bravery cowardice greed arrogance compassion forgiveness
        hospitality integrity
        ''',
    ),
    (
        'colours',
        '🎨',
        ('Màu sắc, hình khối & bề mặt', 'Colours, shapes & textures'),
        '''
        beige maroon turquoise violet lavender crimson scarlet bronze ivory teal khaki
        charcoal triangle rectangle cube sphere cylinder cone pyramid spiral zigzag dot
        checkered spotted glossy silky metallic opaque dense woolly
        ''',
    ),
    (
        'childhood',
        '🧸',
        ('Tuổi thơ & truyện kể', 'Childhood & stories'),
        '''
        toy game story kid play ball kite fairy castle cradle doll lullaby marble nickname
        picnic prank puppet riddle sticker teddy witch mermaid fairytale fable
        ''',
    ),
]


def main() -> int:
    words = json.loads(PACK.read_text(encoding='utf-8'))['words']
    by_word = {w['word'].lower(): w['id'] for w in words}
    topics, missing = [], []
    for tid, emoji, (vi, en), headwords in TOPICS:
        ids = []
        for hw in headwords.split():
            wid = by_word.get(hw.lower())
            if wid is None:
                missing.append(f'{tid}: {hw}')
            elif wid not in ids:
                ids.append(wid)
        topics.append({'id': tid, 'emoji': emoji, 'title': [vi, en], 'wordIds': ids})
    if missing:
        print('Not in the pack:\n  ' + '\n  '.join(missing), file=sys.stderr)
        return 1
    data = {
        'version': 2,
        'note': 'Generated by scripts/build_topics.py — edit the lists there, not this file.',
        'topics': topics,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for t in topics:
        print(f"{t['id']:<12} {len(t['wordIds']):>3} words")
    return 0


if __name__ == '__main__':
    sys.exit(main())
