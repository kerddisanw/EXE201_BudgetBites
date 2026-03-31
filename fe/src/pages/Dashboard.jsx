import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Clock,
    Shield,
    Users,
    Truck,
    Flame,
    Heart,
    Gift,
    Calendar,
    Crown,
    Sparkles,
    ChevronRight,
    Search,
    Quote,
    Star
} from 'lucide-react';
import { feedbackService, menuService, partnerService, packageService } from '../services/api';
import './Dashboard.css';

const POPULAR_DISHES_SEEDS = [
    {
        id: 1,
        name: 'Phở bò Hà Nội',
        pattern: 'phở bò hà nội',
        restaurant: 'Phở Gia Truyền',
        price: 35000,
        orders: 1234,
        rank: 1,
        img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop'
    },
    {
        id: 2,
        name: 'Cơm tấm sườn bì chả',
        pattern: 'cơm tấm sườn bì chả',
        restaurant: 'Cơm Tấm Sài Gòn',
        price: 45000,
        orders: 982,
        rank: 2,
        img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop'
    },
    {
        id: 3,
        name: 'Bún chả Hà Nội',
        pattern: 'bún chả hà nội',
        restaurant: 'Bún Chả Hà Nội',
        price: 40000,
        orders: 876,
        rank: 3,
        img: 'https://images.unsplash.com/photo-1569058242567-93a2b2238c0e?w=400&h=400&fit=crop'
    },
    {
        id: 4,
        name: 'Bánh mì đặc biệt',
        pattern: 'bánh mì đặc biệt',
        restaurant: 'Quán Cô Ba',
        price: 25000,
        orders: 2103,
        rank: 4,
        img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop'
    }
];

const PROMOS = [
    {
        id: 1,
        tag: 'Sự kiện',
        title: 'Ưu đãi Tết Bính Ngọ 2026',
        desc: 'Giảm thêm cho đơn đặt trước tuần mới.',
        foot: 'Đến 15/02/2026',
        gradient: 'home-promo--orange',
        icon: Calendar
    },
    {
        id: 2,
        tag: 'Thành viên',
        title: 'BudgetBites VIP',
        desc: 'Ưu đãi độc quyền & ưu tiên giao.',
        foot: 'Chỉ 30k/tháng',
        gradient: 'home-promo--gold',
        icon: Crown
    },
    {
        id: 3,
        tag: 'Người mới',
        title: 'Mã WELCOME20',
        desc: 'Giảm 20% đơn đầu tiên.',
        foot: 'WELCOME20',
        gradient: 'home-promo--green',
        icon: Gift
    },
    {
        id: 4,
        tag: 'Hot Deal',
        title: 'Combo tuần',
        desc: 'Tiết kiệm khi đặt cả tuần.',
        foot: 'Xem gói →',
        gradient: 'home-promo--purple',
        icon: Sparkles
    }
];

// Note: we intentionally do NOT show fake testimonials on first paint.

const WHY_ITEMS = [
    {
        icon: Clock,
        title: 'Tiết kiệm thời gian',
        text: 'Đặt trước bữa ăn cho cả tuần, không phải lo lắng mỗi ngày.'
    },
    {
        icon: Shield,
        title: 'An toàn vệ sinh',
        text: 'Đối tác quán ăn được kiểm duyệt kỹ lưỡng về chất lượng.'
    },
    {
        icon: Users,
        title: 'Giá sinh viên',
        text: 'Mức giá phù hợp với túi tiền sinh viên, nhiều ưu đãi.'
    },
    {
        icon: Truck,
        title: 'Giao hàng nhanh',
        text: 'Giao hàng đúng giờ, theo dõi đơn hàng real-time.'
    }
];

const STEPS = [
    { n: '01', title: 'Chọn quán ăn', desc: 'Duyệt qua danh sách các quán ăn đối tác chất lượng.' },
    { n: '02', title: 'Lên lịch ăn uống', desc: 'Chọn món ăn cho từng bữa trong tuần.' },
    { n: '03', title: 'Thanh toán', desc: 'Thanh toán online an toàn, nhanh chóng.' },
    { n: '04', title: 'Nhận đồ ăn', desc: 'Nhận bữa ăn tươi ngon đúng giờ.' }
];

const POPULAR_TAGS = ['Phở bò', 'Cơm tấm', 'Bún chả', 'Bánh mì', 'Bún bò Huế', 'Cháo lòng'];

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [search, setSearch] = useState('');
    const [partners, setPartners] = useState([]);
    const [popularDishes, setPopularDishes] = useState([]);
    const [popularDishesReady, setPopularDishesReady] = useState(false);
    const [partnerRatings, setPartnerRatings] = useState({});
    const [testimonials, setTestimonials] = useState([]);
    const [testimonialsReady, setTestimonialsReady] = useState(false);
    const [packages, setPackages] = useState([]);
    const [packagesLoading, setPackagesLoading] = useState(true);

    const normalizeText = (s) => {
        if (!s) return '';
        // Normalize diacritics so we can do basic Vietnamese fuzzy matching.
        return s
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const scoreMealMatch = (mealName, pattern, hasImage) => {
        const a = normalizeText(mealName);
        const b = normalizeText(pattern);
        if (!a || !b) return 0;
        if (a === b) return 220 + (hasImage ? 20 : 0);
        if (a.includes(b) || b.includes(a)) return 140 + (hasImage ? 20 : 0);

        // Token overlap (works reasonably for Vietnamese menu names).
        const aTokens = a.split(' ').filter(Boolean);
        const bTokens = b.split(' ').filter(Boolean);
        const shared = aTokens.filter((t) => bTokens.includes(t));
        return shared.length * 25 + (hasImage ? 20 : 0);
    };

    const formatRelativeTime = (isoOrLocalDateTime) => {
        if (!isoOrLocalDateTime) return '';
        const dt = new Date(isoOrLocalDateTime);
        if (Number.isNaN(dt.getTime())) return '';
        const diffMs = Date.now() - dt.getTime();
        const diffMin = Math.max(0, Math.floor(diffMs / 60000));
        if (diffMin < 60) return `${diffMin} phút trước`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH} giờ trước`;
        const diffD = Math.floor(diffH / 24);
        if (diffD < 7) return `${diffD} ngày trước`;
        const diffW = Math.floor(diffD / 7);
        if (diffW < 5) return `${diffW} tuần trước`;
        const diffM = Math.floor(diffD / 30);
        return `${Math.max(1, diffM)} tháng trước`;
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await partnerService.getAllPartners();
                const list = Array.isArray(res.data) ? res.data : [];
                const activePartners = list.filter((p) => p.active !== false).slice(0, 4);

                if (mounted) setPartners(activePartners);

                // Ratings + testimonials from real feedbacks
                const feedbackResults = await Promise.all(
                    activePartners.map((p) =>
                        feedbackService
                            .getFeedbacksByPartner(p.id)
                            .then((fbRes) => ({
                                partnerId: p.id,
                                partnerName: p.name,
                                feedbacks: Array.isArray(fbRes.data) ? fbRes.data : []
                            }))
                            .catch(() => ({
                                partnerId: p.id,
                                partnerName: p.name,
                                feedbacks: []
                            }))
                    )
                );

                const ratingsMap = {};
                const allFeedbacks = [];
                feedbackResults.forEach(({ partnerId, feedbacks }) => {
                    const listFb = Array.isArray(feedbacks) ? feedbacks : [];
                    const nums = listFb
                        .map((f) => Number(f.rating))
                        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
                    const avg =
                        nums.length === 0
                            ? null
                            : nums.reduce((a, b) => a + b, 0) / nums.length;
                    ratingsMap[partnerId] = { avg, count: nums.length };
                    listFb.forEach((f) => allFeedbacks.push(f));
                });

                allFeedbacks.sort((a, b) => {
                    const da = a?.createdAt ? new Date(a.createdAt) : new Date(0);
                    const db = b?.createdAt ? new Date(b.createdAt) : new Date(0);
                    return db - da;
                });

                const newest = allFeedbacks
                    .filter((f) => f?.comment && f?.rating)
                    .slice(0, 6)
                    .map((f) => {
                        const name = f.customerName || 'Khách hàng';
                        const initial = (name || '?').trim().slice(0, 1).toUpperCase();
                        return {
                            id: f.id,
                            quote: f.comment,
                            name,
                            partnerName: f.partnerName || 'Quán ăn',
                            when: formatRelativeTime(f.createdAt) || 'Gần đây',
                            initial,
                            rating: Number(f.rating) || 5
                        };
                    });

                if (mounted) {
                    setPartnerRatings(ratingsMap);
                    setTestimonials(newest);
                    setTestimonialsReady(true);
                }

                // Fetch packages for upsell
                const pkgRes = await packageService.getAllPackages();
                if (mounted) {
                    setPackages(Array.isArray(pkgRes.data) ? pkgRes.data.slice(0, 3) : []);
                    setPackagesLoading(false);
                }

                // Populate "popular dishes" with real menu pictures (item.imageUrl).
                // We match by dish name pattern against menu itemName.
                const menuResults = await Promise.all(
                    activePartners.map((p) =>
                        menuService
                            .getMenusByPartner(p.id)
                            .then((menusRes) => ({
                                partnerId: p.id,
                                partnerName: p.name,
                                menus: Array.isArray(menusRes.data) ? menusRes.data : []
                            }))
                            .catch(() => ({
                                partnerId: p.id,
                                partnerName: p.name,
                                menus: []
                            }))
                    )
                );

                const candidates = [];
                menuResults.forEach(({ partnerId, partnerName, menus }) => {
                    (menus || []).forEach((menu) => {
                        (menu?.items || []).forEach((item) => {
                            candidates.push({
                                ...item,
                                menuId: menu?.id,
                                partnerId,
                                partnerName
                            });
                        });
                    });
                });

                const used = new Set();
                const updated = POPULAR_DISHES_SEEDS.map((seed) => {
                    let best = null;
                    let bestScore = -1;

                    for (const c of candidates) {
                        const key = `${c.partnerId}-${c.menuId}-${c.id}`;
                        if (used.has(key)) continue;

                        const score = scoreMealMatch(
                            c.itemName,
                            seed.pattern || seed.name,
                            Boolean(c.imageUrl)
                        );
                        if (score > bestScore) {
                            bestScore = score;
                            best = c;
                            best.key = key;
                        }
                    }

                    if (best) used.add(best.key);

                    return {
                        ...seed,
                        img: best?.imageUrl || seed.img,
                        name: best?.itemName || seed.name,
                        restaurant: best?.partnerName || seed.restaurant,
                        price: best?.priceOriginal ?? seed.price
                    };
                });

                if (mounted) {
                    setPopularDishes(updated);
                    setPopularDishesReady(true);
                }
            } catch {
                if (mounted) {
                    setPartners([]);
                    setPopularDishes(POPULAR_DISHES_SEEDS);
                    setPopularDishesReady(true);
                    setPartnerRatings({});
                    setTestimonials([]);
                    setTestimonialsReady(true);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = search.trim();
        if (q) {
            try {
                sessionStorage.setItem('bb_partner_search', q);
            } catch {
                /* ignore */
            }
        }
        navigate('/partners');
    };

    const fmtMoney = (n) => `${Number(n).toLocaleString('vi-VN')}đ`;

    return (
        <div className="home-page">
            <section className="home-hero">
                <div className="home-hero-bg" aria-hidden />
                <div className="home-hero-inner">
                    <h1 className="home-hero-title">Bữa ăn ngon, giá sinh viên</h1>
                    <p className="home-hero-sub">
                        Đặt trước bữa ăn cho cả tuần từ các quán ăn chất lượng
                    </p>
                    <form className="home-search" onSubmit={handleSearch}>
                        <div className="home-search-field">
                            <Search size={20} className="home-search-icon" aria-hidden />
                            <input
                                type="search"
                                placeholder="Bạn muốn ăn gì?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="home-search-input"
                            />
                        </div>
                        <button type="submit" className="home-search-btn">
                            Tìm kiếm <ChevronRight size={18} />
                        </button>
                    </form>
                    <div className="home-popular-tags">
                        <span className="home-popular-label">Phổ biến:</span>
                        <div className="home-tags">
                            {POPULAR_TAGS.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className="home-tag"
                                    onClick={() => {
                                        setSearch(t);
                                        try {
                                            sessionStorage.setItem('bb_partner_search', t);
                                        } catch {
                                            /* ignore */
                                        }
                                        navigate('/partners');
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-section home-why">
                <div className="home-section-inner">
                    <h2 className="home-section-title">Vì sao chọn BudgetBites?</h2>
                    <p className="home-section-lead">
                        Chúng tôi kết nối sinh viên với các quán ăn địa phương chất lượng, mang đến
                        giải pháp ăn uống tiện lợi và tiết kiệm
                    </p>
                    <div className="home-why-grid">
                        {WHY_ITEMS.map(({ icon: Icon, title, text }) => (
                            <div key={title} className="home-why-card">
                                <div className="home-why-icon-wrap">
                                    <Icon size={26} strokeWidth={2} />
                                </div>
                                <h3>{title}</h3>
                                <p>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="home-section home-packages">
                <div className="home-section-inner">
                    <div className="home-packages-head">
                        <span className="home-packages-badge">Tiết kiệm tối đa</span>
                        <h2 className="home-section-title">Gói Ăn Tuần Phổ Biến</h2>
                        <p className="home-section-lead">
                            Tiết kiệm đến 30% khi đăng ký theo gói. Bữa ăn chất lượng, giao tận nơi đúng giờ.
                        </p>
                    </div>
                    <div className="home-packages-grid">
                        {packagesLoading
                            ? [1, 2, 3].map((i) => (
                                  <div key={i} className="home-package-card home-package-card--skeleton" />
                              ))
                            : packages.map((pkg, idx) => {
                                const Icon = idx === 0 ? Clock : idx === 1 ? Crown : Sparkles;
                                return (
                                  <div key={pkg.id} className={`home-package-card ${idx === 1 ? 'home-package-card--popular' : ''}`}>
                                      {idx === 1 && <div className="home-package-trending">Khuyên dùng</div>}
                                      <div className="home-package-icon">
                                          <Icon size={32} />
                                      </div>
                                      <h3>{pkg.packageName}</h3>
                                      <div className="home-package-price">
                                          <span className="price-val">{fmtMoney(pkg.price)}</span>
                                          <span className="price-unit">/{pkg.durationDays} ngày</span>
                                      </div>
                                      <p className="home-package-desc">{pkg.description}</p>
                                      <ul className="home-package-features">
                                          <li><Star size={14} /> {pkg.totalMeals} bữa ăn tươi ngon</li>
                                          <li><Star size={14} /> Thực đơn đa dạng mỗi ngày</li>
                                          <li><Star size={14} /> Miễn phí phí dịch vụ</li>
                                      </ul>
                                      <Link to="/packages" className="home-package-btn">
                                          Chọn gói ngay
                                      </Link>
                                  </div>
                                );
                            })}
                    </div>
                </div>
            </section>


            <section className="home-section home-dishes">
                <div className="home-section-inner">
                    <div className="home-row-head">
                        <div>
                            <h2 className="home-section-title home-section-title--left">
                                <Flame size={22} className="home-title-icon" />
                                Món ăn được đặt nhiều
                            </h2>
                            <p className="home-section-sub">Những món ăn được yêu thích nhất tuần này</p>
                        </div>
                        <Link to="/partners" className="home-see-all">
                            Xem tất cả <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="home-dish-grid">
                        {!popularDishesReady
                            ? [1, 2, 3, 4].map((i) => (
                                  <div
                                      key={i}
                                      className="home-dish-card home-dish-card--skeleton"
                                  />
                              ))
                            : popularDishes.map((d) => (
                            <Link
                                key={d.id}
                                to="/partners"
                                className="home-dish-card"
                            >
                                <div className="home-dish-img-wrap">
                                    <img src={d.img} alt="" loading="lazy" />
                                    <span className="home-dish-badge">#{d.rank} Phổ biến</span>
                                </div>
                                <div className="home-dish-body">
                                    <div className="home-dish-name">{d.name}</div>
                                    <div className="home-dish-rest">{d.restaurant}</div>
                                    <div className="home-dish-foot">
                                        <span className="home-dish-price">{fmtMoney(d.price)}</span>
                                    </div>
                                </div>
                            </Link>
                              ))}
                    </div>
                </div>
            </section>

            <section className="home-section home-restaurants">
                <div className="home-section-inner">
                    <div className="home-row-head">
                        <div>
                            <h2 className="home-section-title home-section-title--left">
                                <Heart size={22} className="home-title-icon home-title-icon--heart" />
                                Nhà hàng yêu thích
                            </h2>
                            <p className="home-section-sub">Các nhà hàng được đánh giá cao nhất</p>
                        </div>
                        <Link to="/partners" className="home-see-all">
                            Xem tất cả <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="home-rest-grid">
                        {partners.length === 0
                            ? [1, 2, 3, 4].map((i) => (
                                  <div key={i} className="home-rest-card home-rest-card--skeleton" />
                              ))
                            : partners.map((p) => (
                                  <Link
                                      key={p.id}
                                      to={`/partners/${p.id}`}
                                      className="home-rest-card"
                                  >
                                      <div className="home-rest-img-wrap">
                                          {p.imageUrl ? (
                                              <img src={p.imageUrl} alt="" loading="lazy" />
                                          ) : (
                                              <div className="home-rest-img-placeholder" />
                                          )}
                                          <span className="home-rest-cat">Quán</span>
                                          <span className="home-rest-fav" aria-hidden>
                                              <Heart size={16} />
                                          </span>
                                      </div>
                                      <div className="home-rest-body">
                                          <div className="home-rest-top">
                                              <span className="home-rest-name">{p.name}</span>
                                              <span className="home-rest-rating">
                                            <Star size={14} fill="currentColor" />{' '}
                                            {partnerRatings[p.id]?.avg
                                                ? partnerRatings[p.id].avg.toFixed(1)
                                                : '—'}
                                              </span>
                                          </div>
                                          <p className="home-rest-meta">
                                        {p.address || 'TP.HCM'} ·{' '}
                                        {partnerRatings[p.id]?.count
                                            ? `${partnerRatings[p.id].count} đánh giá`
                                            : 'Chưa có đánh giá'}
                                          </p>
                                      </div>
                                  </Link>
                              ))}
                    </div>
                </div>
            </section>

            <section className="home-section home-promos">
                <div className="home-section-inner">
                    <div className="home-promos-head">
                        <Gift size={28} className="home-promos-icon" />
                        <h2 className="home-section-title">Chương trình khuyến mãi</h2>
                        <p className="home-section-lead home-section-lead--narrow">
                            Khám phá những ưu đãi hấp dẫn dành cho bạn
                        </p>
                    </div>
                    <div className="home-promo-grid">
                        {PROMOS.map((p) => {
                            const Icon = p.icon;
                            return (
                                <Link
                                    key={p.id}
                                    to="/packages"
                                    className={`home-promo-card ${p.gradient}`}
                                >
                                    <div className="home-promo-visual">
                                        <Icon size={40} strokeWidth={1.5} />
                                    </div>
                                    <div className="home-promo-content">
                                        <span className="home-promo-tag">{p.tag}</span>
                                        <h3>{p.title}</h3>
                                        <p>{p.desc}</p>
                                        <div className="home-promo-foot">
                                            <span>{p.foot}</span>
                                            <span className="home-promo-detail">
                                                Chi tiết <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="home-section home-steps">
                <div className="home-section-inner">
                    <h2 className="home-section-title">Hướng dẫn đặt hàng</h2>
                    <p className="home-section-lead">Chỉ 4 bước đơn giản để có bữa ăn ngon</p>
                    <div className="home-steps-row">
                        {STEPS.map((s, idx) => (
                            <React.Fragment key={s.n}>
                                <div className="home-step">
                                    <span className="home-step-num">{s.n}</span>
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <span className="home-step-arrow" aria-hidden>
                                        →
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            <section className="home-section home-testimonials">
                <div className="home-section-inner">
                    <h2 className="home-section-title">Đánh giá từ người dùng</h2>
                    <p className="home-section-lead">
                        Hàng nghìn sinh viên đã tin tưởng sử dụng BudgetBites
                    </p>
                    <div className="home-testimonial-grid">
                        {!testimonialsReady
                            ? [1, 2, 3, 4, 5, 6].map((i) => (
                                  <div
                                      key={i}
                                      className="home-testimonial-card home-testimonial-card--skeleton"
                                  />
                              ))
                            : testimonials.length === 0
                              ? (
                                    <div className="home-testimonials-empty">
                                        Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm!
                                    </div>
                                )
                              : testimonials.map((t) => (
                                    <article
                                        key={t.id || `${t.name}-${t.partnerName}-${t.quote}`}
                                        className="home-testimonial-card"
                                    >
                                        <Quote size={22} className="home-quote" />
                                        <p className="home-testimonial-text">{t.quote}</p>
                                        <div
                                            className="home-stars"
                                            aria-label={`${t.rating || 0} sao`}
                                        >
                                            {Array.from({ length: 5 }).map((_, idx) => {
                                                const filled =
                                                    idx <
                                                    Math.max(
                                                        0,
                                                        Math.min(5, Number(t.rating) || 0)
                                                    );
                                                return (
                                                    <Star
                                                        key={idx}
                                                        size={16}
                                                        fill={filled ? '#f97316' : 'transparent'}
                                                        color="#f97316"
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="home-testimonial-author">
                                            <span className="home-avatar">{t.initial}</span>
                                            <div>
                                                <div className="home-author-name">{t.name}</div>
                                                <div className="home-author-meta">
                                                    {t.partnerName} · {t.when}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                    </div>
                </div>
            </section>

            {user?.fullName && (
                <section className="home-welcome-strip">
                    <div className="home-section-inner home-welcome-inner">
                        <p>
                            Xin chào, <strong>{user.fullName}</strong> — bắt đầu đặt bữa hoặc xem{' '}
                            <Link to="/account">tài khoản</Link>.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Dashboard;
