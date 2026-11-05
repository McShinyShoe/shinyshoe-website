use leptos::prelude::*;

const GITHUB: &str = "https://github.com/McShinyShoe";

struct Project {
    name: &'static str,
    kind: &'static str,
    language: &'static str,
    description: &'static str,
    links: &'static [Link],
    /// where the mod or plugin can be downloaded
    modrinth: Option<&'static str>,
}

struct Link {
    label: &'static str,
    repo: &'static str,
}

const SOURCE: &str = "View source";

const PROJECTS: [Project; 6] = [
    Project {
        name: "CavernChat",
        kind: "Mod",
        language: "Java",
        description: "Unofficial mod for The Cavern, adds channel filters, a reply indicator and colour coded DMs to chat. Yes this helps with my wc motherfucker :I",
        links: &[Link { label: SOURCE, repo: "cavern-chat" }],
        modrinth: Some("https://modrinth.com/mod/cavern-chat"),
    },
    Project {
        name: "Storage tracker",
        kind: "Mod",
        language: "Java",
        description: "Remembers what's in every chest you open, so you can search which one has the item you need.",
        links: &[Link { label: SOURCE, repo: "storage-tracker" }],
        modrinth: Some("https://modrinth.com/project/storagetracker"),
    },
    Project {
        name: "Journalism",
        kind: "Plugin",
        language: "Java",
        description: "Paper plugin that gives players an in-game journal (wiki, guides or unlockable lore), every menu is just a YAML file.",
        links: &[Link { label: SOURCE, repo: "journalism" }],
        modrinth: Some("https://modrinth.com/plugin/journalism"),
    },
    Project {
        name: "Lestallum website",
        kind: "Website",
        language: "Rust",
        description: "The website for Lestallum Town, built leptos Leptos and Axum too!",
        links: &[Link { label: SOURCE, repo: "lestallum-website" }],
        modrinth: None,
    },
    Project {
        name: "Bifrost",
        kind: "IoT",
        language: "Rust + C++",
        description: "Home IoT, an Arduino reads the room's temperature and humidity and controls the AC over infrared, and also a Rust server for API and website.",
        links: &[
            Link { label: "View server", repo: "bifrost-server" },
            Link { label: "View sensor", repo: "bifrost-sensor" },
        ],
        modrinth: None,
    },
    Project {
        name: "Laravel Docker template",
        kind: "Template",
        language: "Docker",
        description: "Too lazy to set up Laravel in Docker? Copy this and you get a working stack (nginx, PHP and MySQL, plus Redis, Mailhog and phpMyAdmin if you want them).",
        links: &[Link { label: SOURCE, repo: "laravel-docker-template" }],
        modrinth: None,
    },
];

struct Site {
    name: &'static str,
    host: &'static str,
    description: &'static str,
    icon: &'static str,
}

const SITES: [Site; 5] = [
    Site {
        name: "Nextcloud",
        host: "cloud.shinyshoe.net",
        description: "Files, calendar and contacts",
        icon: "cloud",
    },
    Site {
        name: "AFFiNE",
        host: "note.shinyshoe.net",
        description: "Notes, docs and whiteboards",
        icon: "file",
    },
    Site {
        name: "HedgeDoc",
        host: "docs.shinyshoe.net",
        description: "Markdown docs you can write together",
        icon: "pencil",
    },
    Site {
        name: "Website status",
        host: "status.shinyshoe.net",
        description: "Whether everything here is up",
        icon: "activity",
    },
    Site {
        name: "Lestallum",
        host: "lestallum.shinyshoe.net",
        description: "The Lestallum town website",
        icon: "home",
    },
];

const STACK: [&str; 4] = ["Rust", "Leptos", "Axum", "WASM"];

#[component]
pub fn HomePage() -> impl IntoView {
    view! {
        <section class="sh-hero sh-hero--split home-hero">
            <div class="sh-hero__content">
                <span class="sh-eyebrow">"Hi, I'm ShinyShoe"</span>
                <h1 class="sh-hero__title">
                    "I build "
                    <span class="sh-text-rotate">
                        <span class="sh-text-rotate__track">
                            <span class="is-active">"websites"</span>
                            <span>"tools"</span>
                            <span>"bots"</span>
                            <span>"mods"</span>
                        </span>
                    </span>
                </h1>
                <p class="sh-hero__desc">
                    "Just a goober doing goofy things, mostly in Rust and C++ (and sometimes Java)."
                </p>
                <div class="sh-hero__actions">
                    <a class="sh-btn sh-btn--primary" href="#projects">
                        "See projects"
                        <span class="sh-icon" data-icon="arrow-right" aria-hidden="true"></span>
                    </a>
                    <a class="sh-btn sh-btn--secondary" href=GITHUB target="_blank" rel="noopener">
                        "Visit GitHub"
                        <span class="sh-icon" data-icon="external-link" aria-hidden="true"></span>
                    </a>
                </div>
            </div>

            <div class="sh-hero__figure">
                <Terminal/>
            </div>
        </section>

        <section class="home-section" id="projects" aria-labelledby="projects-title">
            <header class="sh-heading">
                <span class="sh-eyebrow">"Projects"</span>
                <h2 class="sh-heading__title" id="projects-title">"Things I've been building"</h2>
                <p class="sh-heading__desc">"A few picks, the rest are on my GitHub."</p>
            </header>

            <div class="home-grid">
                {PROJECTS.iter().map(|project| view! { <ProjectCard project/> }).collect_view()}
            </div>
        </section>

        <section class="home-section home-split" id="self-hosted" aria-labelledby="hosted-title">
            <header class="sh-heading">
                <span class="sh-eyebrow">"Self-hosted stuffz"</span>
                <h2 class="sh-heading__title" id="hosted-title">"Stuff I run myself"</h2>
                <p class="sh-heading__desc">
                    "Everything here runs on my own server, check the status page if one of them looks down."
                </p>
            </header>

            <ul class="sh-list">
                {SITES.iter().map(|site| view! { <SiteRow site/> }).collect_view()}
            </ul>
        </section>

        <section class="home-section" aria-labelledby="site-title">
            <div class="sh-card home-site">
                <header class="sh-heading sh-heading--hero">
                    <span class="sh-eyebrow">"This site"</span>
                    <h2 class="sh-heading__title" id="site-title">"Built with Rust and Leptos"</h2>
                    <p class="sh-heading__desc">
                        "Server rendered with Axum, hydrated with WASM and styled with"
                        "Shiny Design System."
                    </p>
                </header>
                <ul class="home-stack" aria-label="Stack">
                    {STACK.iter().map(|name| view! { <li class="sh-badge">{*name}</li> }).collect_view()}
                </ul>
                <div class="home-site__actions">
                    <a
                        class="sh-btn sh-btn--secondary"
                        href=format!("{GITHUB}/shinyshoe-website")
                        target="_blank"
                        rel="noopener"
                    >
                        "View source"
                        <span class="sh-icon" data-icon="external-link" aria-hidden="true"></span>
                    </a>
                </div>
            </div>
        </section>
    }
}

#[component]
fn Terminal() -> impl IntoView {
    view! {
        <div class="sh-mockup-code" role="img" aria-label="Terminal listing ShinyShoe's projects">
            <div class="sh-mockup__bar">
                <span class="sh-mockup__title">"~/projects"</span>
            </div>
            <pre data-prefix="$"><code><span class="tk-f">"whoami"</span></code></pre>
            <pre data-prefix=">"><code>"shinyshoe"</code></pre>
            <pre data-prefix="$"><code><span class="tk-f">"uname"</span>" -r"</code></pre>
            <pre data-prefix=">"><code>"1.u53-arch-btw"</code></pre>
            <pre data-prefix="$"><code><span class="tk-f">"ls"</span>" "<span class="tk-p">"~/projects"</span></code></pre>
            <pre data-prefix=">"><code>"cavern-chat        storage-tracker"</code></pre>
            <pre data-prefix=">"><code>"journalism         lestallum-website"</code></pre>
            <pre data-prefix=">"><code>"bifrost-server     bifrost-sensor"</code></pre>
            <pre data-prefix=">"><code>"laravel-docker-template"</code></pre>
            <pre data-prefix="$"><code><span class="tk-f">"cargo"</span>" leptos serve"</code></pre>
            <pre data-prefix=">" class="is-hl"><code><span class="tk-ok">"ok"</span>" listening on "<span class="tk-s">"shinyshoe.net"</span></code></pre>
        </div>
    }
}

#[component]
fn SiteRow(site: &'static Site) -> impl IntoView {
    let href = format!("https://{}/", site.host);
    let label = format!("Open {}", site.name);

    view! {
        <li class="sh-list__row">
            <span class="sh-avatar sh-avatar--squircle" aria-hidden="true">
                <span class="sh-icon" data-icon=site.icon></span>
            </span>
            <div class="sh-list__grow">
                <div class="sh-list__title">{site.name}</div>
                <div class="sh-list__desc">{site.description}</div>
            </div>
            <span class="sh-list__meta home-host">{site.host}</span>
            <a class="sh-btn sh-btn--ghost sh-btn--sm" href=href target="_blank" rel="noopener" aria-label=label>
                "Open"
                <span class="sh-icon" data-icon="external-link" aria-hidden="true"></span>
            </a>
        </li>
    }
}

#[component]
fn ProjectCard(project: &'static Project) -> impl IntoView {
    let links = project.links.iter().map(|link| {
        let href = format!("{GITHUB}/{}", link.repo);
        let label = format!("{} on GitHub", link.repo);
        view! {
            <a class="sh-btn sh-btn--ghost sh-btn--sm" href=href target="_blank" rel="noopener" aria-label=label>
                {link.label}
                <span class="sh-icon" data-icon="external-link" aria-hidden="true"></span>
            </a>
        }
    });

    // the card's main action when there's something to download, so it gets the filled button
    let download = project.modrinth.map(|href| {
        let label = format!("Download {} on Modrinth", project.name);
        view! {
            <a class="sh-btn sh-btn--secondary sh-btn--sm" href=href target="_blank" rel="noopener" aria-label=label>
                "Download"
                <span class="sh-icon" data-icon="external-link" aria-hidden="true"></span>
            </a>
        }
    });

    view! {
        <article class="sh-card sh-card--plain sh-card--compact home-project">
            <div class="home-project__meta">
                <span class="sh-badge">{project.kind}</span>
                <span class="home-project__lang">{project.language}</span>
            </div>
            <h3 class="sh-card__title">{project.name}</h3>
            <p class="sh-card__body">{project.description}</p>
            <div class="sh-card__actions">{links.collect_view()}{download}</div>
        </article>
    }
}
