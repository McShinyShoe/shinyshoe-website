use leptos::prelude::*;

#[component]
pub fn NavBar() -> impl IntoView {
    view! {
        <div id="nav" class="fixed left-[10px] right-[10px] top-[10px] z-[9999] transition-all duration-200 ease-out">
            <div
                id="navInner"
                class="bg-base-100 shadow-[0_10px_28px_rgba(0,0,0,0.12)] rounded-[14px] w-full transition-all duration-200 ease-out"
            >
                <div class="navbar px-3 py-2">
                    <div class="navbar-start">
                        <div class="dropdown lg:hidden">
                            <label tabindex="0" class="btn btn-ghost">"☰"</label>
                            <ul tabindex="0" class="menu menu-sm dropdown-content mt-5 z-[10000] p-2 shadow bg-base-100 rounded-box w-52">
                                <li><button>Home</button></li>
                                <li>
                                    <details>
                                        <summary>Mods</summary>
                                        <ul>
                                            <li><button>CavernChat</button></li>
                                        </ul>
                                    </details>
                                </li>
                                <li>
                                    <details>
                                        <summary>Plugins</summary>
                                        <ul>
                                            <li><button>-</button></li>
                                        </ul>
                                    </details>
                                </li>
                                <li><button>About</button></li>
                            </ul>
                        </div>

                        <button class="btn btn-ghost text-xl">ShinyShoe</button>
                    </div>

                    <div class="navbar-center hidden lg:flex">
                        <ul class="menu menu-horizontal px-1">
                            <li><button>Home</button></li>
                            <li>
                                <details>
                                    <summary>Mods</summary>
                                    <ul class="p-2 bg-base-100 w-40 z-2 mt-6">
                                        <li><button>CavernChat</button></li>
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <details>
                                    <summary>Plugins</summary>
                                    <ul class="p-2 bg-base-100 w-40 z-2 mt-6">
                                        <li>-</li>
                                    </ul>
                                </details>
                            </li>
                            <li><button>About</button></li>
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

        <script>
            r#"
            const nav = document.getElementById('nav');
            const navbarInner = document.getElementById('navInner');

            function onScroll() {
                const pinned = window.scrollY > 0;

                nav.classList.toggle('top-[10px]', !pinned);
                nav.classList.toggle('top-0', pinned);

                navbarInner.classList.toggle('rounded-[14px]', !pinned);
                navbarInner.classList.toggle('rounded-t-none', pinned);
                navbarInner.classList.toggle('rounded-b-[14px]', pinned);

                navbarInner.classList.toggle('shadow-[0_10px_28px_rgba(0,0,0,0.12)]', !pinned);
                navbarInner.classList.toggle('shadow-[0_8px_20px_rgba(0,0,0,0.16)]', pinned);
            }

            document.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
            "#
        </script>
    }
}
