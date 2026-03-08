import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About Us | Chilahati Archive",
    description:
        "স্বপ্নতরী ফাউন্ডেশন — A social and voluntary organisation from Chilahati, Domar, Nilphamari. Founded 27 March 2020.",
};

interface MemberCardProps {
    name: string;
    role: string;
    phone: string;
    fb: string;
    img: string;
}

function MemberCard({ name, role, phone, fb, img }: MemberCardProps) {
    return (
        <div
            style={{
                background: "#f9fbfc",
                padding: "25px",
                borderRadius: "20px",
                textAlign: "center",
                border: "1px solid #eee",
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={img}
                alt={name}
                style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    margin: "0 auto 15px",
                    display: "block",
                    border: "3px solid #3498db",
                }}
            />
            <h4 style={{ margin: "10px 0 5px", fontSize: "1.15rem", color: "#2c3e50" }}>{name}</h4>
            <span style={{ color: "#3498db", fontWeight: 600, display: "block", marginBottom: "15px", fontSize: "0.9rem" }}>
                {role}
            </span>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <a
                    href={`tel:${phone}`}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", background: "#2c3e50", fontSize: "0.85rem" }}
                >
                    <i className="fa-solid fa-phone"></i>
                </a>
                <a
                    href={`https://wa.me/88${phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", background: "#25D366", fontSize: "0.85rem" }}
                >
                    <i className="fa-brands fa-whatsapp"></i>
                </a>
                <a
                    href={fb}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", background: "#1877F2", fontSize: "0.85rem" }}
                >
                    <i className="fa-brands fa-facebook-f"></i>
                </a>
            </div>
        </div>
    );
}

interface WorkItem {
    icon: string;
    label: string;
    href: string;
}

function WorkColumn({ title, icon, items }: { title: string; icon: string; items: WorkItem[] }) {
    return (
        <div>
            <h3
                style={{
                    color: "#3498db",
                    borderBottom: "2px solid #eee",
                    paddingBottom: "12px",
                    marginBottom: "20px",
                    fontSize: "1.4rem",
                }}
            >
                <i className={`fa-solid ${icon}`}></i> {title}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "10px 16px",
                            background: "#fff",
                            borderRadius: "12px",
                            border: "1px solid #eee",
                            textDecoration: "none",
                            color: "#2c3e50",
                            gap: "12px",
                        }}
                    >
                        <span
                            style={{
                                background: "#3498db",
                                color: "white",
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "8px",
                                fontSize: "0.85rem",
                                flexShrink: 0,
                            }}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                        </span>
                        <strong style={{ fontSize: "0.9rem" }}>{item.label}</strong>
                    </a>
                ))}
            </div>
        </div>
    );
}

const REPO = "https://raw.githubusercontent.com/mdfhf2020-ui/About-us/main";

const founders = [
    { name: "মোঃ আবু ফারহান", role: "প্রতিষ্ঠাতা", phone: "01717675512", fb: "https://www.facebook.com/abufarhan.farhan.5015", img: `${REPO}/farhan.jpg` },
    { name: "নাজমুস সাদাত সাফিন", role: "প্রতিষ্ঠাতা", phone: "01341285676", fb: "https://www.facebook.com/mdshafin.shafin.716", img: `${REPO}/shafin.jpg` },
];
const committee1 = [
    { name: "কামিয়াব কানন", role: "সভাপতি (১ম কমিটি)", phone: "01402193372", fb: "https://www.facebook.com/ka.non.889819", img: `${REPO}/kanon.jpg` },
    { name: "নাফিস রেজা আরাফাত", role: "সাধারণ সম্পাদক (১ম কমিটি)", phone: "01306173731", fb: "https://www.facebook.com/nafisreza.arafat", img: `${REPO}/nafis.jpg` },
];
const committee2 = [
    { name: "নাজমুস সাদাত সাফিন", role: "সভাপতি (২য় কমিটি)", phone: "01341285676", fb: "https://www.facebook.com/mdshafin.shafin.716", img: `${REPO}/shafin.jpg` },
    { name: "মোঃ ফারহান হাসিন ফাহিম", role: "সাধারণ সম্পাদক (২য় কমিটি)", phone: "01767207999", fb: "https://www.facebook.com/fhf2022", img: `${REPO}/fahim.jpg` },
];

const eduWorks: WorkItem[] = [
    { icon: "fa-university", label: "স্বপ্নতরী পাবলিক লাইব্রেরি স্থাপন", href: "https://www.facebook.com/100080040683288/posts/501377162540302/" },
    { icon: "fa-graduation-cap", label: "জুলাই স্মৃতি শিক্ষা মেলা ২০২৫", href: "https://www.facebook.com/sopnotorifoundationchilahati/videos/2333105527050262/" },
    { icon: "fa-book-quran", label: "ফ্রী কুরআন শিক্ষা কোর্স ২০২৫", href: "https://www.facebook.com/100080040683288/posts/629293549748662/" },
    { icon: "fa-chalkboard-user", label: "শিক্ষা সেমিনার", href: "https://www.facebook.com/share/p/17vZSdkzxY/" },
    { icon: "fa-school", label: "ফ্রী ক্লাস", href: "https://www.facebook.com/share/p/1GJR7AFpHM/" },
    { icon: "fa-award", label: "কৃতি শিক্ষার্থী সংবর্ধনা ২০২৪", href: "https://www.facebook.com/share/p/1CHghifb83/" },
    { icon: "fa-laptop-code", label: "কম্পিউটার কোর্স", href: "https://www.facebook.com/share/p/1BFcekDhDz/" },
    { icon: "fa-microphone-lines", label: "স্বপ্নতরী ডিবেটিং ক্লাব প্রতিষ্ঠা", href: "https://www.facebook.com/share/p/18JWuxgW4w/" },
    { icon: "fa-globe", label: "চিলাহাটি আর্কাইভ ওয়েবসাইট", href: "https://www.facebook.com/share/v/1D5S9f5wbL/" },
];

const socialWorks: WorkItem[] = [
    { icon: "fa-droplet", label: "রক্তদান কর্মসূচি", href: "https://facebook.com/groups/1880350492463054/" },
    { icon: "fa-box-open", label: "ঈদ সামগ্রী বিতরণ", href: "#" },
    { icon: "fa-bowl-food", label: "ইফতার বিতরণ", href: "https://www.facebook.com/share/p/17zxzGjfeL/" },
    { icon: "fa-cow", label: "কোরবানির মাংস বিতরণ", href: "https://www.facebook.com/share/v/1CxXyziHLv/" },
    { icon: "fa-tree", label: "বৃক্ষরোপণ কর্মসূচি", href: "https://www.facebook.com/share/p/1DkVVfHDfp/" },
    { icon: "fa-broom", label: "পরিবেশ পরিচ্ছন্নতা অভিযান", href: "https://www.facebook.com/share/p/1AH4KJix5g/" },
    { icon: "fa-mitten", label: "শীতার্তদের কম্বল বিতরণ", href: "https://www.facebook.com/share/p/17zqk4xPfy/" },
];

export default function AboutPage() {
    return (
        <div className="main-content" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            {/* ── Header ── */}
            <header
                style={{
                    background: "white",
                    padding: "50px 20px 40px",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    borderBottom: "4px solid #3498db",
                }}
            >
                <div
                    style={{
                        width: "130px",
                        height: "130px",
                        background: "#fff",
                        borderRadius: "50%",
                        margin: "0 auto 20px",
                        border: "5px solid #3498db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://raw.githubusercontent.com/mdfhf2020-ui/About-us/main/l.png" alt="স্বপ্নতরী লোগো" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <h2 style={{ margin: "10px 0", fontSize: "2.4rem", fontWeight: 800, color: "#2c3e50" }}>
                    স্বপ্নতরী ফাউন্ডেশন
                </h2>
                <p style={{ margin: 0, fontSize: "1.2rem", color: "#3498db", fontWeight: 600 }}>
                    একটি সামাজিক ও স্বেচ্ছাসেবী সংগঠন
                </p>
                <div
                    style={{
                        display: "inline-block",
                        background: "rgba(52,152,219,0.1)",
                        color: "#2980b9",
                        padding: "8px 25px",
                        borderRadius: "50px",
                        margin: "15px 0",
                        fontWeight: 700,
                        fontSize: "1rem",
                        border: "1.5px dashed #3498db",
                    }}
                >
                    <i className="fa-solid fa-shield-halved"></i> সম্পূর্ণ অরাজনৈতিক ও সেবামূলক প্রতিষ্ঠান
                </div>
                <p
                    style={{
                        margin: "10px 0 0",
                        fontSize: "1rem",
                        color: "#7f8c8d",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                    }}
                >
                    <i className="fa-solid fa-location-dot" style={{ color: "rgb(116,192,252)" }}></i>
                    চিলাহাটি, ডোমার, নীলফামারী
                </p>
            </header>

            {/* ── Hero ── */}
            <section
                style={{
                    background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
                    color: "white",
                    padding: "70px 20px",
                    textAlign: "center",
                }}
            >
                <h1 style={{ fontSize: "2.5rem", marginBottom: "25px", fontWeight: 700 }}>আমরা—</h1>
                <div
                    style={{
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        padding: "25px 40px",
                        borderRadius: "20px",
                        display: "inline-block",
                        border: "1px solid rgba(255,255,255,0.3)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                >
                    <p style={{ fontSize: "1.3rem", fontWeight: 500, margin: 0, fontStyle: "italic" }}>
                        স্বপ্ন দেখি, স্বপ্ন দেখাবো, স্বপ্নের পৃথিবী আমরাই গড়বো
                    </p>
                </div>
            </section>

            {/* ── Main Container ── */}
            <div
                style={{
                    maxWidth: "1100px",
                    margin: "-50px auto 40px",
                    background: "white",
                    padding: "40px",
                    borderRadius: "25px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
            >
                {/* Stats */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "25px",
                        marginBottom: "50px",
                    }}
                >
                    {[
                        { icon: "fa-calendar-check", title: "প্রতিষ্ঠা সাল", body: "২৭শে মার্চ, ২০২০" },
                        { icon: "fa-bullseye", title: "আমাদের লক্ষ্য", body: "শিক্ষা ও সেবামূলক কর্মকাণ্ড পরিচালনা করা" },
                    ].map((stat) => (
                        <div
                            key={stat.title}
                            style={{
                                background: "#f1f7fd",
                                padding: "30px",
                                borderRadius: "20px",
                                textAlign: "center",
                                borderBottom: "5px solid #3498db",
                            }}
                        >
                            <i
                                className={`fa-solid ${stat.icon}`}
                                style={{ fontSize: "2.5rem", color: "#3498db", marginBottom: "15px", display: "block" }}
                            ></i>
                            <h3 style={{ color: "#2c3e50" }}>{stat.title}</h3>
                            <p>{stat.body}</p>
                        </div>
                    ))}
                </div>

                {/* Founders */}
                <h2
                    style={{
                        textAlign: "center",
                        margin: "0 0 25px",
                        fontSize: "1.7rem",
                        color: "#2c3e50",
                        borderBottom: "2px solid #3498db",
                        paddingBottom: "10px",
                    }}
                >
                    সম্মানিত প্রতিষ্ঠাতাবৃন্দ
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "40px" }}>
                    {founders.map((m) => <MemberCard key={m.name} {...m} />)}
                </div>

                {/* 1st Committee */}
                <h2
                    style={{
                        textAlign: "center",
                        margin: "0 0 25px",
                        fontSize: "1.7rem",
                        color: "#2c3e50",
                        borderBottom: "2px solid #3498db",
                        paddingBottom: "10px",
                    }}
                >
                    ১ম কার্যনির্বাহী কমিটি
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "40px" }}>
                    {committee1.map((m) => <MemberCard key={m.name} {...m} />)}
                </div>

                {/* 2nd Committee */}
                <h2
                    style={{
                        textAlign: "center",
                        margin: "0 0 25px",
                        fontSize: "1.7rem",
                        color: "#2c3e50",
                        borderBottom: "2px solid #3498db",
                        paddingBottom: "10px",
                    }}
                >
                    ২য় কার্যনির্বাহী কমিটি
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "40px" }}>
                    {committee2.map((m) => <MemberCard key={m.name} {...m} />)}
                </div>

                {/* Works */}
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "35px",
                        borderTop: "1px solid #eee",
                        paddingTop: "30px",
                        color: "#2c3e50",
                    }}
                >
                    ইতিমধ্যে সম্পাদিত কাজ
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                    <WorkColumn title="শিক্ষা বিষয়ক" icon="fa-book-open" items={eduWorks} />
                    <WorkColumn title="সামাজিক ও সেবামূলক" icon="fa-hand-holding-heart" items={socialWorks} />
                </div>
            </div>

            {/* ── Footer section ── */}
            <div
                style={{
                    background: "#1a252f",
                    color: "#ecf0f1",
                    padding: "60px 20px 20px",
                    borderTop: "6px solid #3498db",
                }}
            >
                <div
                    style={{
                        maxWidth: "1100px",
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr",
                        gap: "60px",
                    }}
                >
                    <div>
                        <h3 style={{ color: "#3498db", fontSize: "1.4rem", marginBottom: "20px" }}>
                            স্বপ্নতরী ফাউন্ডেশন
                        </h3>
                        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#bdc3c7" }}>
                            স্বপ্নতরী ফাউন্ডেশন এসএসসি ২০২০ ব্যাচের উদ্যোগে গড়ে ওঠা একটি সামাজিক, স্বেচ্ছাসেবী ও
                            সম্পূর্ণ অরাজনৈতিক সংগঠন। বর্তমানে বিভিন্ন ব্যাচের অংশগ্রহণে এটি একটি বৃহৎ মানবিক
                            প্ল্যাটফর্মে পরিণত হয়েছে।
                        </p>
                        <div style={{ marginTop: "25px", display: "flex", gap: "12px" }}>
                            {[
                                { href: "https://www.facebook.com/sopnotorifoundationchilahati", icon: "fa-brands fa-facebook-f" },
                                { href: "https://wa.me/8801717675512", icon: "fa-brands fa-whatsapp" },
                                { href: "mailto:sopnotory26@gmail.com", icon: "fa-solid fa-envelope" },
                            ].map((s) => (
                                <a
                                    key={s.href}
                                    href={s.href}
                                    target={s.href.startsWith("mailto") ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "12px",
                                        color: "white",
                                        fontSize: "1.2rem",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        textDecoration: "none",
                                    }}
                                >
                                    <i className={s.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 style={{ color: "#3498db", fontSize: "1.4rem", marginBottom: "20px" }}>যোগাযোগঃ</h3>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            <li
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                    color: "#bdc3c7",
                                    marginBottom: "12px",
                                    fontSize: "0.9rem",
                                }}
                            >
                                <i className="fa-solid fa-location-dot" style={{ color: "#3498db", marginTop: "4px" }}></i>
                                চিলাহাটি, ডোমার, নীলফামারী, বাংলাদেশ।
                            </li>
                            <li
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                    color: "#bdc3c7",
                                    fontSize: "0.9rem",
                                }}
                            >
                                <i className="fa-solid fa-phone" style={{ color: "#3498db", marginTop: "4px" }}></i>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <span>০১৭১৭-৬৭৫৫১২ (ফারহান)</span>
                                    <span>০১৩৪১-২৮৫৬৭৬ (সাফিন)</span>
                                    <span>০১৭৬৭-২০৭৯৯৯ (ফাহিম)</span>
                                </div>
                            </li>
                        </ul>
                        <div style={{ marginTop: "20px" }}>
                            <Link href="/contact" style={{ color: "#3498db", textDecoration: "none", fontWeight: 600 }}>
                                <i className="fas fa-envelope"></i> Contact us →
                            </Link>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        marginTop: "50px",
                        paddingTop: "25px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        textAlign: "center",
                    }}
                >
                    <p style={{ fontSize: "0.85rem", margin: "5px 0", color: "#7f8c8d" }}>
                        &copy; 2026 <strong>স্বপ্নতরী ফাউন্ডেশন</strong>। সর্বস্বত্ব সংরক্ষিত।
                    </p>

                </div>
            </div>
        </div>
    );
}
