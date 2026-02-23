import { useEffect, useMemo, useState } from "react";
import { cn } from "./utils/cn";

// Типы для заказа и тарифов
interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlight?: boolean;
}

interface OrderItem {
  id: string;
  planId: string;
  planName: string;
  quantity: number;
  giftWrap: boolean;
  total: number;
  createdAt: string;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    description: "Для тех, кто хочет познакомиться с силой Золотого Молота.",
    features: [
      "1 Золотой Молот",
      "Базовые чары ремонта",
      "Телепортация в пределах дома",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 199,
    description: "Оптимальный выбор для активных людей и путешественников.",
    features: [
      "2 Золотых Молота",
      "Расширенные улучшения предметов",
      "Телепортация на любое расстояние",
      "Приоритетная поддержка духов-кузнецов",
    ],
    highlight: true,
  },
  {
    id: "collector",
    name: "Collector",
    price: 399,
    description: "Для коллекционеров и героев, которые любят максимум.",
    features: [
      "3 Золотых Молота",
      "Уникальная гравировка",
      "Подарочный артефакт-кейс",
      "Персональный ритуал активации",
    ],
  },
];

const GIFT_WRAP_PRICE = 15;

// Утилита для локального хранилища
const STORAGE_KEY = "golden-hammer-orders";

function loadOrders(): OrderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OrderItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveOrders(orders: OrderItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

// Хук появления секций при скролле
function useRevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-animate]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// Простая анимация параллакса для hero
function useHeroParallax() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero-parallax]");
    if (!hero) return;

    const onMove = (event: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const hammer = hero.querySelector<HTMLElement>("[data-hero-hammer]");
      if (!hammer) return;
      hammer.style.transform = `translate3d(${x * 16}px, ${y * 16}px, 0) rotate3d(${y}, ${-x}, 0, 10deg)`;
    };

    const reset = () => {
      const hammer = hero.querySelector<HTMLElement>("[data-hero-hammer]");
      if (!hammer) return;
      hammer.style.transform = "translate3d(0,0,0) rotate3d(0,0,0,0deg)";
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", reset);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", reset);
    };
  }, []);
}

// Простая "конфетти" анимация
function launchConfetti() {
  const container = document.body;
  const count = 80;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "vw";
    el.style.backgroundColor = ["#facc15", "#f97316", "#22c55e", "#38bdf8"][
      Math.floor(Math.random() * 4)
    ];
    el.style.animationDelay = Math.random() * 0.3 + "s";
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 2000);
  }
}

// Компонент логотипа
function Logo() {
  return (
    <a
      href="#hero"
      className="flex items-center gap-2 text-gold-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-full px-2 py-1"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-gold-500 to-amber-400 shadow-lg shadow-amber-900/40">
        <span className="text-xl" aria-hidden="true">
          🔨
        </span>
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-semibold tracking-tight">Золотой Молот</span>
        <span className="text-xs text-gold-200/80">Всегда под рукой</span>
      </span>
    </a>
  );
}

// Компонент Header с липким меню
function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#hero", label: "Hero" },
    { href: "#features", label: "Функции" },
    { href: "#solution", label: "Наше решение" },
    { href: "#how-it-works", label: "Как это работает" },
    { href: "#pricing", label: "Цены" },
    { href: "#testimonials", label: "Отзывы" },
    { href: "#faq", label: "FAQ" },
    { href: "#contacts", label: "Контакты" },
  ];

  const handleNavClick = (href: string) => {
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex" aria-label="Главное меню">
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="relative text-sm font-medium text-slate-200/80 transition-colors hover:text-gold-300 focus:outline-none focus-visible:text-gold-200"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:shadow-amber-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:inline-flex"
          >
            Купить сейчас
          </a>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-100 shadow-sm transition hover:border-gold-400 hover:text-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Открыть меню"
            aria-expanded={open}
          >
            <span className="sr-only">Открыть меню</span>
            <span className="relative block h-4 w-4">
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-0.5 rounded-full bg-current transition-transform",
                  open && "translate-y-1.5 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-1.5 h-0.5 rounded-full bg-current transition-opacity",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-3 h-0.5 rounded-full bg-current transition-transform",
                  open && "-translate-y-1.5 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-slate-800/70 bg-slate-950/95 px-4 pb-4 pt-2 text-sm text-slate-100 md:hidden"
          aria-label="Мобильное меню"
        >
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-100/90 transition hover:bg-slate-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

// HERO секция
function Hero() {
  useHeroParallax();

  const scrollToPricing = () => {
    const target = document.querySelector("#pricing");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 pb-20 pt-28 text-slate-100"
      data-hero-parallax
      data-animate
    >
      {/* Фоновое свечение */}
      <div className="pointer-events-none absolute -left-16 top-44 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 lg:flex-row lg:px-6">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/50 bg-slate-900/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold-200/90 shadow shadow-amber-500/20 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Магический инструмент нового поколения
          </p>

          <div className="space-y-3">
            <h1
              id="hero-title"
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            >
              Золотой Молот — решение, которое всегда под рукой.
            </h1>
            <p className="text-balance text-base text-slate-300 sm:text-lg">
              Молот, который чинит, улучшает, исцеляет и возвращает — делая вашу жизнь проще.
              У вас есть проблемы — у нас решение!
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-200/90">
            <p className="font-medium text-gold-100">
              Заказать сейчас — почувствуй результат в первые дни.
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 lg:justify-start">
              <li className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Мгновенный ремонт одним ударом
              </li>
              <li className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Телепортация к владельцу в один клик
              </li>
              <li className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Мягкое исцеление рядом с вами
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={scrollToPricing}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40 transition hover:-translate-y-0.5 hover:shadow-amber-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Заказать Золотой Молот
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm transition hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Смотреть, как это работает
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400 lg:justify-start">
            <span>— Обычным людям</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block" />
            <span>— Путешественникам</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block" />
            <span>— Коллекционерам</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block" />
            <span>— Медикам и врачам</span>
          </div>
        </div>

        {/* Иллюстрация молота */}
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative h-[320px] w-[260px] max-w-full">
            <div className="absolute inset-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-800 shadow-2xl shadow-black/50 ring-1 ring-gold-500/30" />

            <div
              className="relative inset-0 flex h-full items-center justify-center"
              data-hero-hammer
            >
              <div className="relative flex h-64 w-40 items-center justify-center">
                <img
                  src="/assets/golden-hammer.png"
                  alt="Иллюстрация Золотого Молота"
                  className="pointer-events-none select-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
                />

                {/* Мерцающие частицы */}
                <span className="pointer-events-none absolute -right-2 -top-3 h-10 w-10 animate-ping-slow rounded-full bg-sky-400/40 blur-md" />
                <span className="pointer-events-none absolute -left-3 top-10 h-8 w-8 animate-pulse rounded-full bg-emerald-400/30 blur" />
                <span className="pointer-events-none absolute bottom-2 right-4 h-12 w-12 animate-ping-slow rounded-full bg-amber-400/40 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Блок наше решение / ваша проблема
function SolutionBlock() {
  return (
    <section
      id="solution"
      aria-labelledby="solution-title"
      className="bg-slate-950 py-16 text-slate-50"
      data-animate
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
              Наше решение / Ваша проблема
            </p>
            <h2 id="solution-title" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Проблемы, которые Золотой Молот решает за один удар
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-300">
            Вещи ломаются в самый неподходящий момент? Золотой Молот создан, чтобы снять с вас
            головную боль ремонта, экономя время, деньги и нервы.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 p-6 shadow-lg shadow-black/40">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
              Ваша проблема
            </h3>
            <ul className="space-y-2 text-sm text-slate-200">
              <li>• Вещи ломаются в самый неподходящий момент?</li>
              <li>• Нужный инструмент отсутствует или опять не там, где вы его оставили?</li>
              <li>• Ремонт стоит дорого и занимает недели ожидания?</li>
              <li>• Хрупкие предметы страшно трогать, не говоря уже о починке?</li>
            </ul>
          </div>

          <div className="space-y-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-900/40 to-slate-900 p-6 shadow-lg shadow-emerald-900/50">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Наше решение
            </h3>
            <p className="text-sm text-slate-50">
              Это Молот, который сможет починить ваши предметы за 1 удар — вы забудете о проблемах
              навсегда. Экономим время и деньги, возвращаем уверенность.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-emerald-50/90">
              <li>• Чинит предмет одним ударом — без шума и лишней пыли.</li>
              <li>• Изменяет размер предметов по желанию: уменьшите диван, чтобы перевезти, а потом верните размер.</li>
              <li>• Постепенно исцеляет людей, если положить молот рядом — мягко и безопасно.</li>
              <li>• Телепортируется к владельцу на любое расстояние — он всегда рядом, когда нужен.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Карточка фичи
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article
      className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/30 transition-transform transition-colors hover:-translate-y-1 hover:border-gold-400/70 hover:bg-slate-900"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-xl shadow-inner shadow-black/40">
        <span aria-hidden="true">{icon}</span>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-50">{title}</h3>
      <p className="text-xs text-slate-300">{description}</p>
    </article>
  );
}

// Секция функций
function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="bg-slate-950 py-16 text-slate-50"
      data-animate
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
              Возможности
            </p>
            <h2 id="features-title" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Один молот — пять магических способностей
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-300">
            Все функции Золотого Молота работают интуитивно: просто выберите режим, сделайте удар
            или положите молот рядом — и магия начнёт своё дело.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          <FeatureCard
            icon="🔨"
            title="Чинит предмет одним ударом"
            description="Верните вещи в идеальное состояние за секунды. Молот сам подбирает способ ремонта."
          />
          <FeatureCard
            icon="📏"
            title="Изменяет размер предметов"
            description="Увеличьте или уменьшите любой предмет: от чемодана до гаража — без потери качества."
          />
          <FeatureCard
            icon="❤️"
            title="Постепенное исцеление"
            description="Положите молот рядом — и его поле мягко поддержит восстановление организма."
          />
          <FeatureCard
            icon="✨"
            title="Улучшает предметы"
            description="Двойной удар — и ваш предмет становится лучше: крепче, красивее, функциональнее."
          />
          <FeatureCard
            icon="💫"
            title="Телепортируется к владельцу"
            description="Просто нажмите кнопку призыва — молот вернётся к вам с любого расстояния."
          />
        </div>
      </div>
    </section>
  );
}

// Секция "Как это работает"
function HowItWorks() {
  const [demoState, setDemoState] = useState<"broken" | "fixed" | "upgraded">("broken");
  const [isHammering, setIsHammering] = useState(false);

  const handleDemoClick = () => {
    if (isHammering) return;
    setIsHammering(true);
    setDemoState("fixed");
    setTimeout(() => {
      setDemoState("upgraded");
      setIsHammering(false);
    }, 1100);
  };

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="bg-gradient-to-b from-slate-900 to-slate-950 py-16 text-slate-50"
      data-animate
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
              Как это работает
            </p>
            <h2 id="how-title" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Пошаговая магия, понятная без инструкции
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-300">
            Никаких сложных ритуалов: Золотой Молот реагирует на количество ударов и ваше
            намерение. Просто следуйте простому таймлайну.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
          <ol className="space-y-4 text-sm">
            <li className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-slate-950">
                1
              </div>
              <div>
                <h3 className="font-semibold">Один удар — ремонт</h3>
                <p className="text-xs text-slate-300">
                  Направьте молот на повреждённый предмет и аккуратно ударьте один раз. Алгоритмы
                  магического ремонта восстановят структуру без следов.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-slate-950">
                2
              </div>
              <div>
                <h3 className="font-semibold">Два удара — улучшение</h3>
                <p className="text-xs text-slate-300">
                  Дважды коснитесь поверхности, чтобы активировать улучшение: повышенная прочность,
                  защита от износа, глубокий глянец — молот знает, что нужно.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-slate-950">
                3
              </div>
              <div>
                <h3 className="font-semibold">Положите рядом — исцеление</h3>
                <p className="text-xs text-slate-300">
                  Разместите молот рядом с человеком. Тёплое поле постепенно поддержит восстановление
                  сил, не нарушая естественные процессы.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-xs font-semibold text-slate-950">
                4
              </div>
              <div>
                <h3 className="font-semibold">Нажмите кнопку — телепорт</h3>
                <p className="text-xs text-slate-300">
                  Используйте встроенную кнопку-призыв на рукояти — и молот вернётся к вам из любой
                  точки мира. Даже если вы забыли его в другой реальности.
                </p>
              </div>
            </li>
          </ol>

          {/* Демонстрация механики */}
          <div className="relative rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/40">
            <p className="mb-3 text-xs font-medium text-slate-300">
              Мини-демо: нажмите на молот, чтобы увидеть, как разбитый предмет сначала чинится, а
              затем улучшается.
            </p>
            <div className="relative flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={handleDemoClick}
                className={cn(
                  "relative flex h-28 w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 shadow-xl shadow-amber-900/60 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  isHammering && "animate-hammer"
                )}
                aria-label="Проиграть демо удара молота"
              >
                <span className="absolute -top-3 right-2 h-4 w-8 rounded-full bg-slate-900/70" />
                <span className="text-2xl" aria-hidden="true">
                  🔨
                </span>
              </button>

              <div className="relative h-24 flex-1 rounded-2xl bg-slate-900/80 p-3">
                <div
                  className={cn(
                    "flex h-full items-center justify-center rounded-xl border border-dashed text-xs font-medium transition-all",
                    demoState === "broken" && "border-rose-400/70 bg-rose-950/40 text-rose-100",
                    demoState === "fixed" && "border-emerald-400/70 bg-emerald-950/40 text-emerald-100",
                    demoState === "upgraded" && "border-sky-400/80 bg-sky-950/40 text-sky-100 shadow-[0_0_25px_rgba(56,189,248,0.6)]"
                  )}
                >
                  {demoState === "broken" && "Разбитый предмет"}
                  {demoState === "fixed" && "Предмет восстановлен"}
                  {demoState === "upgraded" && "Предмет улучшен ✨"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Форма заказа / цены
function PricingSection() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro");
  const [quantity, setQuantity] = useState<number>(1);
  const [giftWrap, setGiftWrap] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<OrderItem[]>(() => loadOrders());
  const [submitting, setSubmitting] = useState(false);
  const [completeOrder, setCompleteOrder] = useState<OrderItem | null>(null);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[0],
    [selectedPlanId]
  );

  const totalPrice = useMemo(() => {
    const base = selectedPlan.price * quantity;
    const extra = giftWrap ? GIFT_WRAP_PRICE : 0;
    return base + extra;
  }, [selectedPlan.price, quantity, giftWrap]);

  const handleOpenModal = () => {
    setCompleteOrder(null);
    setModalOpen(true);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => Math.min(9, Math.max(1, q + delta)));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    // Адрес считывается формой, но в демо-логике явно не используется

    if (!name || !email) {
      alert("Пожалуйста, заполните имя и email.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const id = "ZM-" + Math.floor(Math.random() * 999999).toString().padStart(6, "0");
      const order: OrderItem = {
        id,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        quantity,
        giftWrap,
        total: totalPrice,
        createdAt: new Date().toISOString(),
      };

      const next = [order, ...orders].slice(0, 10);
      setOrders(next);
      saveOrders(next);
      setCompleteOrder(order);
      setSubmitting(false);
      launchConfetti();
    }, 900);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="bg-slate-950 py-16 text-slate-50"
      data-animate
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-10 space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
            Цены и заказ
          </p>
          <h2 id="pricing-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
            Выберите свой Золотой Молот
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-300">
            Присоединяйтесь к сотням довольных клиентов — сделайте шаг прямо сейчас. Все заказы на
            этой странице демонстрационные, реальная оплата не производится.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
          {/* Тарифы */}
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <button
                type="button"
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "flex flex-col rounded-2xl border bg-slate-900/80 p-5 text-left shadow-lg shadow-black/40 transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  plan.highlight
                    ? "border-gold-500/70 ring-1 ring-amber-400/60"
                    : "border-slate-800",
                  selectedPlanId === plan.id &&
                    "border-gold-400 bg-slate-900 ring-1 ring-amber-400/80"
                )}
                aria-pressed={selectedPlanId === plan.id}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-50">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="rounded-full bg-gradient-to-r from-gold-500 to-amber-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-950">
                      Популярный
                    </span>
                  )}
                </div>
                <p className="mb-3 text-xs text-slate-300">{plan.description}</p>
                <p className="mb-4 text-2xl font-semibold text-gold-100">
                  {plan.price}
                  <span className="text-xs text-slate-400"> крон</span>
                </p>
                <ul className="mt-auto space-y-1 text-xs text-slate-200">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Форма заказа */}
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">Фейковая корзина</h3>
                <p className="text-xs text-slate-400">
                  Проверьте параметры заказа и нажмите «Купить» для демонстрации.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                Демо-режим
              </span>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-950/80 p-4 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Тариф</span>
                <span className="font-medium text-gold-100">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Количество молотов</span>
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-100 transition hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    aria-label="Уменьшить количество"
                  >
                    −
                  </button>
                  <span className="min-w-[2ch] text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-100 transition hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    aria-label="Увеличить количество"
                  >
                    +
                  </button>
                </div>
              </div>
              <label className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Подарочная упаковка</span>
                <span className="inline-flex items-center gap-2">
                  <span className="text-slate-400">+{GIFT_WRAP_PRICE} крон</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-gold-400 focus:ring-gold-400"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                  />
                </span>
              </label>
              <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3">
                <span className="text-slate-300">Итого</span>
                <span className="text-lg font-semibold text-gold-100">
                  {totalPrice}
                  <span className="ml-1 text-xs text-slate-400">крон</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span>Купить</span>
              <span aria-hidden="true">→</span>
            </button>

            <p className="text-[11px] leading-relaxed text-slate-500">
              Нажимая «Купить», вы переходите в демонстрационный режим оплаты. Деньги никуда не
              спишутся, а вы увидите, как будет выглядеть подтверждение заказа.
            </p>
          </div>
        </div>

        {/* Список сохранённых заказов */}
        {orders.length > 0 && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-100">Ваши демо-заказы (localStorage)</h3>
              <span className="text-[10px] text-slate-500">Хранятся только в этом браузере</span>
            </div>
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/80 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gold-100">Заказ {order.id}</span>
                    <span className="text-[11px] text-slate-400">
                      {order.planName} · {order.quantity} шт. · {order.total} крон
                      {order.giftWrap ? " · с подарочной упаковкой" : ""}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(order.createdAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Модальное окно */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-black">
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-300 transition hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Закрыть окно"
              >
                ✕
              </button>

              {!completeOrder ? (
                <>
                  <h3 className="mb-1 text-sm font-semibold text-slate-50">Демо-оплата</h3>
                  <p className="mb-4 text-xs text-slate-400">
                    Заполните форму — и мы покажем вам демонстрационное подтверждение заказа. Никаких
                    реальных платежей.
                  </p>

                  <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-slate-200">Имя*</span>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-black/40 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                          placeholder="Например, Артём"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-slate-200">E-mail*</span>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-black/40 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                          placeholder="you@example.com"
                        />
                      </label>
                    </div>
                    <label className="space-y-1">
                      <span className="text-slate-200">Адрес (произвольный)</span>
                      <input
                        type="text"
                        name="address"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-black/40 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                        placeholder="Город, улица, квартира — как в сказке"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-slate-200">Способ оплаты</span>
                      <select
                        name="payment"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-inner shadow-black/40 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                        defaultValue="card"
                      >
                        <option value="card">Оплата картой (демо)</option>
                        <option value="magic">Оплата маной (недоступно)</option>
                      </select>
                    </label>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                      <span className="text-slate-300">Итого к оплате (демо)</span>
                      <span className="text-lg font-semibold text-gold-100">
                        {totalPrice}
                        <span className="ml-1 text-xs text-slate-400">крон</span>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/50 transition hover:-translate-y-0.5 hover:shadow-amber-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Обработка..." : "Оплатить (демо)"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/90 text-lg shadow-lg shadow-emerald-900/70">
                      ✅
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-50">Заказ подтверждён</h3>
                      <p className="text-xs text-slate-400">
                        Спасибо — ничего не будет отправлено, транзакция демонстрационная.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <p className="text-[11px] text-slate-400">Номер заказа</p>
                    <p className="text-base font-semibold text-gold-100">{completeOrder.id}</p>
                    <p className="mt-2 text-[11px] text-slate-400">Состав заказа</p>
                    <p className="text-xs text-slate-200">
                      {completeOrder.planName} · {completeOrder.quantity} шт. · {completeOrder.total} крон
                      {completeOrder.giftWrap ? " · с подарочной упаковкой" : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Отзывы
function Testimonials() {
  const items = [
    {
      name: "Ольга П.",
      role: "Ремонт без ожидания",
      text: "Дверца шкафа отваливалась месяцами. Один вечер с Золотым Молотом — и я заодно починила половину квартиры.",
    },
    {
      name: "Иван К.",
      role: "Путешественник",
      text: "Главное — телепортация. Забыл молот у друзей в другой стране, нажал кнопку — через секунду он в руках.",
    },
    {
      name: "Доктор Л.",
      role: "Врач-реабилитолог",
      text: "Используем молот в палате отдыха — пациенты отмечают, что восстанавливаются спокойнее и быстрее.",
    },
    {
      name: "Антон Р.",
      role: "Коллекционер артефактов",
      text: "Версия Collector с гравировкой стала центром моей коллекции. И да, улучшать экспонаты — отдельное удовольствие.",
    },
  ];

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="bg-slate-950 py-16 text-slate-50"
      data-animate
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
            Отзывы
          </p>
          <h2
            id="testimonials-title"
            className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl"
          >
            Люди уже пользуются Золотым Молотом — рассказываем честно
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <figure
              key={item.name}
              className={cn(
                "card-fade flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200 shadow-lg shadow-black/40",
                `delay-${index}`
              )}
            >
              <blockquote className="flex-1 text-[11px] leading-relaxed text-slate-300">
                “{item.text}”
              </blockquote>
              <figcaption className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <span className="font-medium text-slate-50">{item.name}</span>
                <span>{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ
function FAQ() {
  const items = [
    {
      q: "Это настоящий продукт или демо?",
      a: "Этот лендинг демонстрационный. Никакие реальные транзакции не совершаются, данные никуда не отправляются.",
    },
    {
      q: "Безопасно ли исцеление с помощью молота?",
      a: "В рамках легенды Золотого Молота поле работает мягко и поддерживающе. В реальном мире обращайтесь к квалифицированным врачам.",
    },
    {
      q: "Можно ли использовать молот для масштабных строительных работ?",
      a: "Да, по описанию — да. Молот сам подстраивает силу удара и не разрушает несущие конструкции.",
    },
    {
      q: "Что будет с моими заказами после обновления страницы?",
      a: "История демо-заказов хранится в localStorage этого браузера. Она не синхронизируется и может быть очищена вручную.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-slate-950 py-16 text-slate-50"
      data-animate
    >
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">FAQ</p>
          <h2 id="faq-title" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Ответы на частые вопросы
          </h2>
        </div>

        <div className="space-y-3 text-sm">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs transition-transform",
                      isOpen && "rotate-90 border-gold-400 text-gold-200"
                    )}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 px-4 pb-3 text-xs text-slate-300">{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Контакты + футер
function Footer() {
  return (
    <footer id="contacts" className="border-t border-slate-800 bg-slate-950 py-10 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 text-xs lg:flex-row lg:items-start lg:justify-between lg:px-6">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-[11px] text-slate-400">
            Золотой Молот — концепция магического инструмента. Этот сайт создан как демонстрационный
            лендинг без реальной продажи.
          </p>
        </div>

        <div className="grid flex-1 gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-100">Контакты (фиктивные)</h3>
            <p className="text-[11px] text-slate-400">
              E-mail: support@golden-hammer.demo
              <br />
              Телефон: +7 (000) 000-00-00
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-100">Документы</h3>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <a href="#" className="hover:text-gold-300">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-300">
                  Пользовательское соглашение
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-100">Мы в соцсетях</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="#"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[13px] hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Перейти в условный Telegram"
              >
                TG
              </a>
              <a
                href="#"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[13px] hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Перейти в условный VK"
              >
                VK
              </a>
              <a
                href="#"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[13px] hover:border-gold-400 hover:text-gold-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Перейти в условный YouTube"
              >
                YT
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-900 pt-4 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} Золотой Молот · Демонстрационный лендинг. Все совпадения с
        реальностью случайны.
      </div>
    </footer>
  );
}

export function App() {
  useRevealOnScroll();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <main>
        <Hero />
        <SolutionBlock />
        <Features />
        <HowItWorks />
        <PricingSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
