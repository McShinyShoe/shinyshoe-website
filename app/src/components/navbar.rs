use leptos::{ev, prelude::*};
use leptos_router::components::A;

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
        let y = web_sys::window().unwrap().scroll_y().unwrap_or(0.0);
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
