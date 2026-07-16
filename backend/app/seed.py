"""Seed categories, photographers (existing + 4 new), demo users, and sample bookings."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import (
    Booking,
    BookingStatus,
    Category,
    Package,
    Photographer,
    PortfolioItem,
    Review,
    User,
    UserRole,
)
from app.security import hash_password

CATEGORIES = [
    {"id": 1, "label": "Wedding", "image": "photo-1519741497674-611481863552", "price_from": 280},
    {"id": 2, "label": "Portrait", "image": "photo-1606216794074-735e91aa2c92", "price_from": 195},
    {"id": 3, "label": "Corporate", "image": "photo-1560472355-536de3962603", "price_from": 250},
    {"id": 4, "label": "Family", "image": "photo-1476703993599-0035a21b17a9", "price_from": 195},
    {"id": 5, "label": "Birthday", "image": "photo-1530103862676-de8c9debad1d", "price_from": 150},
    {"id": 6, "label": "Editorial", "image": "photo-1469334031218-e382a71b716b", "price_from": 400},
    {"id": 7, "label": "Maternity", "image": "photo-1492725764893-90b379c2b6e7", "price_from": 195},
    {"id": 8, "label": "Newborn", "image": "photo-1556910103-1c02745aae4d", "price_from": 195},
]

# Unique avatars/covers for p7–p10 (not used as photographer avatars/covers in p1–p6)
PHOTOGRAPHERS = [
    {
        "id": "p1",
        "name": "Isabelle Fontaine",
        "avatar": "photo-1487412720507-e7ab37603c6f",
        "cover": "photo-1511285560929-80b456fea0bc",
        "specialties": ["Wedding", "Portrait", "Couples"],
        "bio": "Paris-trained fine art photographer with a signature soft-light editorial style. I believe every wedding and portrait session deserves to feel like a still from your favourite film — golden, real, unhurried.",
        "experience": 9,
        "rating": 4.9,
        "review_count": 214,
        "location": "New York, NY",
        "starting_price": 320,
        "featured": True,
        "portfolio": [
            {"id": "po1", "image": "photo-1519741497674-611481863552", "category": "Wedding", "alt": "Bride in golden light"},
            {"id": "po2", "image": "photo-1606216794074-735e91aa2c92", "category": "Portrait", "alt": "Editorial portrait"},
            {"id": "po3", "image": "photo-1583939003579-730e3918a45a", "category": "Wedding", "alt": "Couple ceremony kiss"},
            {"id": "po4", "image": "photo-1529636798458-92182e662485", "category": "Couples", "alt": "Couple in sunset field"},
            {"id": "po5", "image": "photo-1494790108377-be9c29b29330", "category": "Portrait", "alt": "Studio portrait"},
            {"id": "po6", "image": "photo-1465495976277-4387d4b0b4c6", "category": "Wedding", "alt": "Wedding reception details"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Portrait Session",
                "price": 320,
                "duration": "1.5 hrs",
                "description": "Single-location portrait or couples shoot",
                "includes": ["40 edited photos", "Private gallery", "2 print credits"],
            },
            {
                "id": "pk2",
                "name": "Wedding Half-Day",
                "price": 1800,
                "duration": "6 hrs",
                "description": "Getting ready through first dance",
                "includes": ["500+ edited photos", "Online gallery (1 yr)", "USB keepsake", "Engagement session"],
            },
            {
                "id": "pk3",
                "name": "Wedding Full-Day",
                "price": 2900,
                "duration": "10 hrs",
                "description": "Complete wedding day coverage",
                "includes": [
                    "900+ edited photos",
                    "Online gallery (3 yrs)",
                    "Luxury USB + prints",
                    "Engagement + bridal session",
                    "Second shooter",
                ],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Mara & James Collins",
                "avatar": "photo-1438761681033-6461ffad8d80",
                "rating": 5,
                "date": "2025-06-10",
                "text": "Isabelle captured every emotion we didn't even know we were feeling. Our wedding photos are beyond anything we dreamed of.",
                "service": "Wedding Full-Day",
            },
            {
                "id": "r2",
                "author": "Priya Nair",
                "avatar": "photo-1534528741775-53994a69daeb",
                "rating": 5,
                "date": "2025-05-22",
                "text": "I was so nervous for my headshots but Isabelle made me feel completely at ease. The results are stunning.",
                "service": "Portrait Session",
            },
        ],
    },
    {
        "id": "p2",
        "name": "Marcus Webb",
        "avatar": "photo-1507003211169-0a1dd7228f2d",
        "cover": "photo-1540575467063-178a50c2df87",
        "specialties": ["Corporate", "Events", "Headshots"],
        "bio": "Commercial and corporate photographer serving Fortune 500 clients and growing startups alike. Clean, contemporary imagery that communicates professionalism and brand identity at a glance.",
        "experience": 12,
        "rating": 4.8,
        "review_count": 178,
        "location": "San Francisco, CA",
        "starting_price": 250,
        "featured": True,
        "portfolio": [
            {"id": "po1", "image": "photo-1560472355-536de3962603", "category": "Corporate", "alt": "Corporate headshot"},
            {"id": "po2", "image": "photo-1515187029135-18ee286d815b", "category": "Events", "alt": "Conference event coverage"},
            {"id": "po3", "image": "photo-1522202176988-66273c2fd55f", "category": "Corporate", "alt": "Team photo"},
            {"id": "po4", "image": "photo-1559136555-9303baea8ebd", "category": "Headshots", "alt": "Professional headshot"},
            {"id": "po5", "image": "photo-1497366216548-37526070297c", "category": "Events", "alt": "Product launch event"},
            {"id": "po6", "image": "photo-1531058020387-3be344556be6", "category": "Events", "alt": "Gala event"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Headshot Session",
                "price": 250,
                "duration": "1 hr",
                "description": "Professional headshots for individuals or small teams",
                "includes": ["20 edited images", "2 background options", "Same-week delivery"],
            },
            {
                "id": "pk2",
                "name": "Team Portraits",
                "price": 680,
                "duration": "3 hrs",
                "description": "Up to 10 team members, consistent style",
                "includes": ["100+ edited images", "Brand colour grading", "Social + print ready files"],
            },
            {
                "id": "pk3",
                "name": "Event Coverage",
                "price": 1200,
                "duration": "8 hrs",
                "description": "Full conference, product launch, or gala coverage",
                "includes": ["600+ edited images", "48-hr turnaround", "Web gallery + download"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Tasha Brennan, CEO Luminary Labs",
                "avatar": "photo-1573497019940-1c28c88b4f3e",
                "rating": 5,
                "date": "2025-06-01",
                "text": "Marcus delivered a brand photo library that elevated our entire online presence. Fast, professional, and genuinely talented.",
                "service": "Event Coverage",
            },
        ],
    },
    {
        "id": "p3",
        "name": "Aiko Nakamura",
        "avatar": "photo-1544005313-94ddf0286df2",
        "cover": "photo-1476703993599-0035a21b17a9",
        "specialties": ["Family", "Maternity", "Newborn"],
        "bio": "Specialising in the tender, fleeting moments of early family life. My studio and outdoor sessions are gentle, unhurried, and designed to capture genuine connection — not posed perfection.",
        "experience": 7,
        "rating": 4.9,
        "review_count": 312,
        "location": "Austin, TX",
        "starting_price": 195,
        "featured": False,
        "portfolio": [
            {"id": "po1", "image": "photo-1476703993599-0035a21b17a9", "category": "Family", "alt": "Family in meadow"},
            {"id": "po2", "image": "photo-1492725764893-90b379c2b6e7", "category": "Maternity", "alt": "Maternity portrait"},
            {"id": "po3", "image": "photo-1556910103-1c02745aae4d", "category": "Newborn", "alt": "Newborn studio shot"},
            {"id": "po4", "image": "photo-1516627145497-ae6968895b74", "category": "Family", "alt": "Family with children"},
            {"id": "po5", "image": "photo-1541956799312-3f9df99e0006", "category": "Maternity", "alt": "Outdoor maternity"},
            {"id": "po6", "image": "photo-1555252333-9f8e92e65df9", "category": "Newborn", "alt": "Newborn with parents"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Mini Session",
                "price": 195,
                "duration": "45 min",
                "description": "Quick, sweet session for families and individuals",
                "includes": ["25 edited photos", "Online gallery", "1 print credit"],
            },
            {
                "id": "pk2",
                "name": "Family Session",
                "price": 380,
                "duration": "2 hrs",
                "description": "Relaxed outdoor or studio family portraits",
                "includes": ["75 edited photos", "Private gallery (1 yr)", "4 print credits"],
            },
            {
                "id": "pk3",
                "name": "Maternity + Newborn Bundle",
                "price": 620,
                "duration": "2 sessions",
                "description": "Maternity shoot + newborn session within 2 weeks of birth",
                "includes": ["120 edited photos", "Gallery + USB", "Canvas print included"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Sophie & Daniel Park",
                "avatar": "photo-1531746020798-e6953c6e8e04",
                "rating": 5,
                "date": "2025-06-18",
                "text": "Aiko has a magical way of making kids (and anxious parents!) feel at ease. Our family photos are treasures we'll keep forever.",
                "service": "Family Session",
            },
            {
                "id": "r2",
                "author": "Leila Moradi",
                "avatar": "photo-1487412720507-e7ab37603c6f",
                "rating": 5,
                "date": "2025-05-09",
                "text": "My maternity photos are absolutely breathtaking. Aiko has such a gentle, artistic eye.",
                "service": "Maternity + Newborn Bundle",
            },
        ],
    },
    {
        "id": "p4",
        "name": "Declan Murphy",
        "avatar": "photo-1500648767791-00dcc994a43e",
        "cover": "photo-1414235077428-338989a2e8c0",
        "specialties": ["Birthday", "Events", "Celebration"],
        "bio": "Energy, joy, and colour — that's what I bring to every birthday, graduation, and milestone celebration. From intimate backyard parties to luxury venue events, I document the moments you'll want to relive.",
        "experience": 5,
        "rating": 4.7,
        "review_count": 89,
        "location": "Chicago, IL",
        "starting_price": 150,
        "featured": False,
        "portfolio": [
            {"id": "po1", "image": "photo-1530103862676-de8c9debad1d", "category": "Birthday", "alt": "Birthday cake and candles"},
            {"id": "po2", "image": "photo-1464366400600-7168b8af9bc3", "category": "Events", "alt": "Celebration party"},
            {"id": "po3", "image": "photo-1533174072545-7a4b6ad7a6c3", "category": "Birthday", "alt": "Children's birthday party"},
            {"id": "po4", "image": "photo-1496337589254-7e19d01cec44", "category": "Events", "alt": "Graduation celebration"},
            {"id": "po5", "image": "photo-1578985545062-69928b1d9587", "category": "Birthday", "alt": "Adult birthday celebration"},
            {"id": "po6", "image": "photo-1519671482749-fd09be7ccebf", "category": "Events", "alt": "Anniversary party"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "2-Hour Coverage",
                "price": 150,
                "duration": "2 hrs",
                "description": "Perfect for small birthday parties and intimate gatherings",
                "includes": ["60 edited photos", "Online gallery", "48-hr delivery"],
            },
            {
                "id": "pk2",
                "name": "Half-Day Party",
                "price": 320,
                "duration": "4 hrs",
                "description": "Capture every part of your celebration",
                "includes": ["200 edited photos", "Gallery + download", "Slideshow video"],
            },
            {
                "id": "pk3",
                "name": "Full Event",
                "price": 580,
                "duration": "8 hrs",
                "description": "All-day coverage for large events and milestone parties",
                "includes": ["400+ edited photos", "Same-week delivery", "Highlight reel video", "Print package"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Nina Adeyemi",
                "avatar": "photo-1554151228-14d9def656e4",
                "rating": 5,
                "date": "2025-05-30",
                "text": "Declan captured my daughter's first birthday in the most beautiful way. Every little detail was documented. Worth every penny!",
                "service": "Half-Day Party",
            },
        ],
    },
    {
        "id": "p5",
        "name": "Valentina Cruz",
        "avatar": "photo-1531746020798-e6953c6e8e04",
        "cover": "photo-1502904550040-7534597429ae",
        "specialties": ["Portrait", "Fashion", "Editorial"],
        "bio": "Bold, graphic editorial photography for brands, artists, and individuals who want imagery with attitude. My work has been featured in Vogue España, i-D, and over 30 independent publications.",
        "experience": 11,
        "rating": 4.8,
        "review_count": 156,
        "location": "Los Angeles, CA",
        "starting_price": 400,
        "featured": True,
        "portfolio": [
            {"id": "po1", "image": "photo-1469334031218-e382a71b716b", "category": "Fashion", "alt": "High fashion editorial"},
            {"id": "po2", "image": "photo-1509631179647-0177331693ae", "category": "Portrait", "alt": "Dramatic studio portrait"},
            {"id": "po3", "image": "photo-1515886657613-9f3515b0c78f", "category": "Fashion", "alt": "Model outdoor shoot"},
            {"id": "po4", "image": "photo-1496747611176-843222e1e57c", "category": "Editorial", "alt": "Editorial lookbook"},
            {"id": "po5", "image": "photo-1524504388940-b1c1722653e1", "category": "Portrait", "alt": "Close-up portrait"},
            {"id": "po6", "image": "photo-1487412720507-e7ab37603c6f", "category": "Fashion", "alt": "Street fashion"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Creative Portrait",
                "price": 400,
                "duration": "2 hrs",
                "description": "Expressive, styled portrait session with full creative direction",
                "includes": ["50 edited images", "Mood board collaboration", "2 look changes"],
            },
            {
                "id": "pk2",
                "name": "Editorial Shoot",
                "price": 950,
                "duration": "Full day",
                "description": "Magazine-quality editorial for brands or personal projects",
                "includes": ["150+ edited images", "Stylist coordination", "Usage licence", "BTS video"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Jordan Reeves",
                "avatar": "photo-1507003211169-0a1dd7228f2d",
                "rating": 5,
                "date": "2025-06-25",
                "text": "Valentina is a true artist. She understood my creative vision instantly and the results were beyond my expectations.",
                "service": "Creative Portrait",
            },
        ],
    },
    {
        "id": "p6",
        "name": "Samuel Osei",
        "avatar": "photo-1506794778202-cad84cf45f1d",
        "cover": "photo-1514306191717-452ec28c7814",
        "specialties": ["Wedding", "Cultural", "Documentary"],
        "bio": "Documentary-style wedding and cultural ceremony photographer. I believe in watching first, shooting second — letting stories unfold naturally rather than manufacturing moments.",
        "experience": 8,
        "rating": 4.7,
        "review_count": 97,
        "location": "Atlanta, GA",
        "starting_price": 280,
        "featured": False,
        "portfolio": [
            {"id": "po1", "image": "photo-1519225421980-715cb0215aed", "category": "Wedding", "alt": "Traditional ceremony"},
            {"id": "po2", "image": "photo-1567633752046-d1ae8b07b406", "category": "Cultural", "alt": "Cultural celebration"},
            {"id": "po3", "image": "photo-1605100804763-247f67b3557e", "category": "Wedding", "alt": "Wedding reception candid"},
            {"id": "po4", "image": "photo-1591604466107-ec97de577aff", "category": "Documentary", "alt": "Documentary style"},
            {"id": "po5", "image": "photo-1513278974582-3e1b4a4fa21e", "category": "Cultural", "alt": "Cultural portrait"},
            {"id": "po6", "image": "photo-1465495976277-4387d4b0b4c6", "category": "Wedding", "alt": "Wedding details"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Ceremony Coverage",
                "price": 280,
                "duration": "3 hrs",
                "description": "Ceremony + post-ceremony portraits",
                "includes": ["150 edited images", "Online gallery", "2-week delivery"],
            },
            {
                "id": "pk2",
                "name": "Full Wedding Documentary",
                "price": 2200,
                "duration": "10 hrs",
                "description": "Complete documentary wedding coverage",
                "includes": ["800+ edited images", "Short film (5–8 min)", "Gallery + USB", "Second shooter"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Amara & Kwame Boateng",
                "avatar": "photo-1580489944761-15a19d654956",
                "rating": 5,
                "date": "2025-06-05",
                "text": "Samuel understood the significance of every moment in our Ghanaian-American wedding. His documentary approach captured our story with so much respect and beauty.",
                "service": "Full Wedding Documentary",
            },
        ],
    },
    # --- Four new photographers (unique avatars & covers) ---
    {
        "id": "p7",
        "name": "Noor Al-Rashid",
        "avatar": "photo-1529626455594-4ff0802cfb7e",
        "cover": "photo-1492691527719-9d1e07e534b4",
        "specialties": ["Portrait", "Editorial", "Fashion"],
        "bio": "Light-obsessed portrait and fashion photographer based in Toronto. I build quiet, luminous frames that feel like stills from a film you never want to end.",
        "experience": 6,
        "rating": 4.8,
        "review_count": 64,
        "location": "Toronto, ON",
        "starting_price": 275,
        "featured": True,
        "portfolio": [
            {"id": "po1", "image": "photo-1441986300917-64674bd600d8", "category": "Editorial", "alt": "Editorial window light"},
            {"id": "po2", "image": "photo-1502920917128-1aa500764cbd", "category": "Portrait", "alt": "Soft natural portrait"},
            {"id": "po3", "image": "photo-1478144592103-25e218a04891", "category": "Fashion", "alt": "Fashion street frame"},
            {"id": "po4", "image": "photo-1542038784456-1ea8e935640e", "category": "Portrait", "alt": "Studio colour portrait"},
            {"id": "po5", "image": "photo-1493863641943-9b68992a8d07", "category": "Editorial", "alt": "Magazine-style crop"},
            {"id": "po6", "image": "photo-1482049016688-2d3e1b311543", "category": "Fashion", "alt": "Lookbook detail"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Studio Portrait",
                "price": 275,
                "duration": "1.5 hrs",
                "description": "Directed portrait session with two lighting setups",
                "includes": ["35 edited images", "Online gallery", "Colour + B&W selects"],
            },
            {
                "id": "pk2",
                "name": "Fashion Day Rate",
                "price": 1100,
                "duration": "Full day",
                "description": "On-location or studio fashion coverage",
                "includes": ["120+ edited images", "Mood board consult", "Commercial usage licence"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Elena Vos",
                "avatar": "photo-1548142813-c348350df52b",
                "rating": 5,
                "date": "2025-07-02",
                "text": "Noor's portraits feel cinematic without being overproduced. Absolutely recommending her to every creative friend I have.",
                "service": "Studio Portrait",
            },
        ],
    },
    {
        "id": "p8",
        "name": "Kai Mendoza",
        "avatar": "photo-1507591064344-4c6ce005b128",
        "cover": "photo-1452587925148-ce544e77e70d",
        "specialties": ["Wedding", "Couples", "Elopement"],
        "bio": "Adventure elopement and intimate wedding photographer. Rain, cliffs, city rooftops — if it matters to you, I'll be there with a quiet shutter.",
        "experience": 10,
        "rating": 4.9,
        "review_count": 141,
        "location": "Denver, CO",
        "starting_price": 350,
        "featured": True,
        "portfolio": [
            {"id": "po1", "image": "photo-1520854221256-17451cc331bf", "category": "Wedding", "alt": "Mountain elopement"},
            {"id": "po2", "image": "photo-1519225421980-715cb0215aed", "category": "Wedding", "alt": "Intimate vows"},
            {"id": "po3", "image": "photo-1522673607200-164a1a99ac4b", "category": "Couples", "alt": "Couples hike portrait"},
            {"id": "po4", "image": "photo-1465495976277-4387d4b0b4c6", "category": "Wedding", "alt": "Ring and florals"},
            {"id": "po5", "image": "photo-1511285560929-80b456fea0bc", "category": "Elopement", "alt": "Golden hour vows"},
            {"id": "po6", "image": "photo-1583939003579-730e3918a45a", "category": "Couples", "alt": "Ceremony kiss"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Elopement Half-Day",
                "price": 950,
                "duration": "4 hrs",
                "description": "Vow exchange + portraits in one scenic location",
                "includes": ["250+ edited photos", "Online gallery", "Travel within 50 mi"],
            },
            {
                "id": "pk2",
                "name": "Adventure Full-Day",
                "price": 2400,
                "duration": "10 hrs",
                "description": "Sunrise-to-sunset coverage for destination elopements",
                "includes": ["700+ edited photos", "Highlight film", "Second shooter option"],
            },
            {
                "id": "pk3",
                "name": "Couples Session",
                "price": 350,
                "duration": "2 hrs",
                "description": "Engagement or anniversary portraits outdoors",
                "includes": ["60 edited photos", "Private gallery", "Print release"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Riley & Sam Ortiz",
                "avatar": "photo-1521119989659-a3529878996f",
                "rating": 5,
                "date": "2025-06-28",
                "text": "Kai made our mountain elopement feel effortless. The photos look like a love letter to that day.",
                "service": "Adventure Full-Day",
            },
        ],
    },
    {
        "id": "p9",
        "name": "Priya Desai",
        "avatar": "photo-1573496359142-b8d87734a5a2",
        "cover": "photo-1554048612-b6a482bc67e5",
        "specialties": ["Family", "Birthday", "Lifestyle"],
        "bio": "Warm lifestyle photographer for busy families who want real laughter, not stiff poses. Sessions move at kid-speed — and that's the point.",
        "experience": 8,
        "rating": 4.8,
        "review_count": 203,
        "location": "Seattle, WA",
        "starting_price": 210,
        "featured": False,
        "portfolio": [
            {"id": "po1", "image": "photo-1609220136736-443140cffec6", "category": "Family", "alt": "Family picnic"},
            {"id": "po2", "image": "photo-1476703993599-0035a21b17a9", "category": "Lifestyle", "alt": "Park lifestyle frame"},
            {"id": "po3", "image": "photo-1516627145497-ae6968895b74", "category": "Family", "alt": "Kids running"},
            {"id": "po4", "image": "photo-1530103862676-de8c9debad1d", "category": "Birthday", "alt": "Birthday candles"},
            {"id": "po5", "image": "photo-1464366400600-7168b8af9bc3", "category": "Birthday", "alt": "Party moments"},
            {"id": "po6", "image": "photo-1503454537195-1dcabb73ffb9", "category": "Lifestyle", "alt": "Home lifestyle"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Lifestyle Mini",
                "price": 210,
                "duration": "45 min",
                "description": "Quick outdoor session for growing families",
                "includes": ["30 edited photos", "Online gallery", "1 print credit"],
            },
            {
                "id": "pk2",
                "name": "Family Story",
                "price": 420,
                "duration": "2 hrs",
                "description": "Home or park session with guided prompts",
                "includes": ["80 edited photos", "Gallery (1 yr)", "Album credit"],
            },
            {
                "id": "pk3",
                "name": "Birthday Party",
                "price": 360,
                "duration": "3 hrs",
                "description": "Cake, chaos, and candids covered",
                "includes": ["150 edited photos", "Same-week sneak peeks", "Download gallery"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Hannah Cho",
                "avatar": "photo-1544005313-94ddf0286df2",
                "rating": 5,
                "date": "2025-05-14",
                "text": "Priya somehow got all three kids smiling in the same frame. Magic and patience in equal measure.",
                "service": "Family Story",
            },
        ],
    },
    {
        "id": "p10",
        "name": "Jonas Bergström",
        "avatar": "photo-1560250097-0b93528c311a",
        "cover": "photo-1516035069371-29a1b244cc32",
        "specialties": ["Corporate", "Headshots", "Product"],
        "bio": "Scandinavian-minimal commercial photographer. Clean lines, honest light, and brand imagery that still feels human.",
        "experience": 14,
        "rating": 4.7,
        "review_count": 112,
        "location": "Boston, MA",
        "starting_price": 295,
        "featured": False,
        "portfolio": [
            {"id": "po1", "image": "photo-1560472354-b33ff0c44a43", "category": "Corporate", "alt": "Office brand story"},
            {"id": "po2", "image": "photo-1559136555-9303baea8ebd", "category": "Headshots", "alt": "Executive headshot"},
            {"id": "po3", "image": "photo-1497366216548-37526070297c", "category": "Corporate", "alt": "Workspace detail"},
            {"id": "po4", "image": "photo-1522202176988-66273c2fd55f", "category": "Corporate", "alt": "Team collaboration"},
            {"id": "po5", "image": "photo-1505740420928-5e560c06d30e", "category": "Product", "alt": "Product on desk"},
            {"id": "po6", "image": "photo-1460925895917-afdab827c52f", "category": "Product", "alt": "Brand product still"},
        ],
        "packages": [
            {
                "id": "pk1",
                "name": "Executive Headshots",
                "price": 295,
                "duration": "1 hr",
                "description": "Polished headshots for leaders and founders",
                "includes": ["15 edited images", "Two backgrounds", "LinkedIn-ready crops"],
            },
            {
                "id": "pk2",
                "name": "Brand Day",
                "price": 1450,
                "duration": "Full day",
                "description": "Team, workspace, and product coverage",
                "includes": ["300+ edited images", "Shot list planning", "Web + print files"],
            },
        ],
        "reviews": [
            {
                "id": "r1",
                "author": "Claire Nguyen, VP Marketing",
                "avatar": "photo-1573497019940-1c28c88b4f3e",
                "rating": 5,
                "date": "2025-06-12",
                "text": "Jonas delivered a cohesive brand library in one day. Our site and pitch decks finally look like the same company.",
                "service": "Brand Day",
            },
        ],
    },
]

DEMO_USERS = [
    {
        "email": "admin@example.com",
        "password": "admin123",
        "full_name": "TicketNest Admin",
        "role": UserRole.admin.value,
    },
    {
        "email": "customer@example.com",
        "password": "customer123",
        "full_name": "Casey Customer",
        "role": UserRole.customer.value,
    },
    {
        "email": "photographer@example.com",
        "password": "photo123",
        "full_name": "Noor Al-Rashid",
        "role": UserRole.photographer.value,
        "photographer_id": "p7",
    },
]

# Casey Customer: 3 past + 1 upcoming bookings against real packages
DEMO_BOOKINGS = [
    {
        "id": "b1",
        "user_email": "customer@example.com",
        "photographer_id": "p1",
        "package_id": "pk1",
        "package_name": "Portrait Session",
        "price": 320,
        "duration": "1.5 hrs",
        "scheduled_at": datetime(2025, 11, 12, 14, 0, tzinfo=timezone.utc),
        "status": BookingStatus.completed.value,
        "notes": "Outdoor portraits in Central Park",
    },
    {
        "id": "b2",
        "user_email": "customer@example.com",
        "photographer_id": "p3",
        "package_id": "pk2",
        "package_name": "Family Session",
        "price": 380,
        "duration": "2 hrs",
        "scheduled_at": datetime(2026, 2, 8, 10, 30, tzinfo=timezone.utc),
        "status": BookingStatus.completed.value,
        "notes": "Family session at Zilker Park",
    },
    {
        "id": "b3",
        "user_email": "customer@example.com",
        "photographer_id": "p2",
        "package_id": "pk1",
        "package_name": "Headshot Session",
        "price": 250,
        "duration": "1 hr",
        "scheduled_at": datetime(2026, 4, 20, 16, 0, tzinfo=timezone.utc),
        "status": BookingStatus.completed.value,
        "notes": "Professional LinkedIn headshots",
    },
    {
        "id": "b4",
        "user_email": "customer@example.com",
        "photographer_id": "p5",
        "package_id": "pk1",
        "package_name": "Creative Portrait",
        "price": 400,
        "duration": "2 hrs",
        "scheduled_at": datetime(2026, 8, 15, 13, 0, tzinfo=timezone.utc),
        "status": BookingStatus.upcoming.value,
        "notes": "Editorial-style creative portraits",
    },
]


def _seed_categories(db: Session) -> None:
    if db.query(Category).count() > 0:
        return
    for row in CATEGORIES:
        db.add(Category(**row))


def _seed_users(db: Session) -> dict[str, User]:
    linked: dict[str, User] = {}
    for row in DEMO_USERS:
        existing = db.query(User).filter(User.email == row["email"]).first()
        if existing:
            if "photographer_id" in row:
                linked[row["photographer_id"]] = existing
            continue
        user = User(
            email=row["email"],
            hashed_password=hash_password(row["password"]),
            full_name=row["full_name"],
            role=row["role"],
            is_active=True,
        )
        db.add(user)
        db.flush()
        if "photographer_id" in row:
            linked[row["photographer_id"]] = user
    return linked


def _seed_photographers(db: Session, user_links: dict[str, User]) -> None:
    for data in PHOTOGRAPHERS:
        if db.get(Photographer, data["id"]):
            continue
        photographer = Photographer(
            id=data["id"],
            name=data["name"],
            avatar=data["avatar"],
            cover=data["cover"],
            specialties=data["specialties"],
            bio=data["bio"],
            experience=data["experience"],
            rating=data["rating"],
            review_count=data["review_count"],
            location=data["location"],
            starting_price=data["starting_price"],
            featured=data["featured"],
            user_id=user_links[data["id"]].id if data["id"] in user_links else None,
        )
        db.add(photographer)
        for item in data["portfolio"]:
            db.add(PortfolioItem(photographer_id=data["id"], **item))
        for pkg in data["packages"]:
            db.add(Package(photographer_id=data["id"], **pkg))
        for rev in data["reviews"]:
            db.add(Review(photographer_id=data["id"], **rev))


def _seed_bookings(db: Session) -> None:
    if db.query(Booking).count() > 0:
        return
    for row in DEMO_BOOKINGS:
        user = db.query(User).filter(User.email == row["user_email"]).first()
        if not user:
            continue
        db.add(
            Booking(
                id=row["id"],
                user_id=user.id,
                photographer_id=row["photographer_id"],
                package_id=row["package_id"],
                package_name=row["package_name"],
                price=row["price"],
                duration=row["duration"],
                scheduled_at=row["scheduled_at"],
                status=row["status"],
                notes=row.get("notes"),
            )
        )


def seed_database(db: Session | None = None) -> None:
    own_session = db is None
    if own_session:
        db = SessionLocal()
    try:
        _seed_categories(db)
        user_links = _seed_users(db)
        _seed_photographers(db, user_links)
        db.flush()
        _seed_bookings(db)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        if own_session:
            db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    seed_database()


if __name__ == "__main__":
    init_db()
    print("Database initialized and seeded.")
