use leptos::{ev, prelude::*};
use leptos_router::components::A;
use web_sys::window;

#[derive(Clone)]
pub enum NavItem {
    Link {
        label: &'static str,
        href: &'static str,
    },
    Dropdown {
        label: &'static str,
        children: Vec<NavItem>,
    },
}

impl NavItem {
    pub fn link(label: &'static str, href: &'static str) -> Self {
        Self::Link { label, href }
    }

    pub fn dropdown(label: &'static str, children: Vec<NavItem>) -> Self {
        Self::Dropdown { label, children }
    }
}

fn render_nav_item(item: NavItem) -> impl IntoView {
    match item {
        NavItem::Link { label, href } => view! {
            <li>
                <A href=href>
                    <button>{label}</button>
                </A>
            </li>
        }
        .into_any(),

        NavItem::Dropdown { label, children } => view! {
            <li>
                <details>
                    <summary>{label}</summary>
                    <ul>
                        {children.into_iter().map(render_nav_item).collect_view()}
                    </ul>
                </details>
            </li>
        }
        .into_any(),
    }
}

#[component]
pub fn NavBar() -> impl IntoView {
    fn set_theme(theme: &str) {
        let window = window().unwrap();
        let document = window.document().unwrap();
        let html = document.document_element().unwrap();

        html.set_attribute("data-theme", theme).unwrap();
        window
            .local_storage()
            .unwrap()
            .unwrap()
            .set_item("theme", theme)
            .unwrap();
    }

    let nav_items = vec![
        NavItem::link("Home", "/"),
        NavItem::dropdown(
            "Mods",
            vec![NavItem::link("CavernChat", "/mods/cavern-chat")],
        ),
        NavItem::dropdown("Plugins", vec![NavItem::link("-", "")]),
        NavItem::link("About", "/about"),
    ];

    let (pinned, set_pinned) = signal(false);

    window_event_listener(ev::scroll, move |_| {
        let y = window().unwrap().scroll_y().unwrap_or(0.0);
        set_pinned.set(y > 0.0);
    });

    let nav_class = move || {
        format!(
            "fixed left-[10px] right-[10px] z-[9999] transition-all duration-200 ease-out {}",
            if pinned.get() { "top-0" } else { "top-[10px]" }
        )
    };

    let nav_inner_class = move || {
        format!(
            "bg-base-100 w-full transition-all duration-200 ease-out {} {}",
            if pinned.get() {
                "rounded-t-none rounded-b-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
            } else {
                "rounded-[14px] shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
            },
            ""
        )
    };

    let switch_state = move || {
        let document = window().unwrap().document().unwrap();
        let html = document.document_element().unwrap();

        html.get_attribute("data-theme")
            .map(|t| t == "dark")
            .unwrap_or(false)
    };

    view! {
        <div id="nav" class=nav_class>
            <div id="navInner" class=nav_inner_class>
                <div class="navbar px-3 py-2">
                    <div class="navbar-start">
                        <div class="dropdown lg:hidden">
                            <label tabindex="0" class="btn btn-ghost">"☰"</label>
                            <ul tabindex="0" class="menu menu-sm dropdown-content mt-5 z-[10000] p-2 shadow bg-base-100 rounded-box w-52">
                                {nav_items.clone().into_iter().map(render_nav_item).collect_view()}
                            </ul>
                        </div>

                        <button class="btn btn-ghost text-xl">ShinyShoe</button>
                    </div>

                    <div class="navbar-center hidden lg:flex">
                        <ul class="menu menu-horizontal px-1">
                            {nav_items.clone().into_iter().map(render_nav_item).collect_view()}
                        </ul>
                    </div>

                    <div class="navbar-end flex gap-2">
                        <label class="toggle text-base-content">
                            <input type="checkbox" prop:checked=switch_state on:change=move |ev| {
                                let checked = event_target_checked(&ev);
                                let theme = if checked { "dark" } else { "light" };
                                set_theme(theme);
                            }/>

                            <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>

                            <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>
                        </label>
                        <input type="text" placeholder="Search" class="input input-bordered w-32 lg:w-auto" />
                        <div class="dropdown dropdown-end">
                            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                                <div class="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                </div>
                            </div>
                            <ul
                                tabindex="-1"
                                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-6 w-52 p-2 shadow">
                                <li><a href="/profile">Profile</a></li>
                                <li><a href="/settings">Settings</a></li>
                                <li><a href="/logout">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
