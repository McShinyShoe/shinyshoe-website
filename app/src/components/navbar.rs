use leptos::prelude::*;
use leptos_router::components::A;

#[derive(Clone, Copy)]
pub struct NavItem {
    label: &'static str,
    href: &'static str,
}

impl NavItem {
    pub const fn link(label: &'static str, href: &'static str) -> Self {
        Self { label, href }
    }
}

// da navbar
const NAV_ITEMS: [NavItem; 4] = [
    NavItem::link("Home", "/"),
    NavItem::link("Mods", "/mods"),
    NavItem::link("Plugins", "/plugins"),
    NavItem::link("About", "/about"),
];

#[component]
pub fn NavBar() -> impl IntoView {
    view! {
        <header class="sh-navbar">
            <div class="sh-navbar__start">
                <a class="sh-navbar__brand" href="/">
                    <img src="/images/shiny-wordmark-smoke.svg" alt="ShinyShoe" width="400" height="159"/>
                </a>
            </div>

            <nav class="sh-navbar__center" id="main-nav" aria-label="Main">
                <ul class="sh-menu sh-menu--horizontal sh-menu--flush">
                    {NAV_ITEMS
                        .into_iter()
                        .map(|item| view! {
                            <li>
                                // "/" would just match all page without `exact` :I
                                <A href=item.href exact=item.href == "/" attr:class="sh-menu__item">
                                    {item.label}
                                </A>
                            </li>
                        })
                        .collect_view()}
                </ul>
            </nav>

            <div class="sh-navbar__end">
                <button
                    class="sh-btn sh-btn--icon sh-navbar__toggle"
                    type="button"
                    aria-label="Menu"
                    aria-expanded="false"
                    aria-controls="main-nav"
                >
                    <span class="sh-icon" data-icon="menu" aria-hidden="true"></span>
                </button>
            </div>
        </header>
    }
}
