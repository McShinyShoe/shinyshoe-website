use leptos::prelude::*;

#[component]
pub fn Err404() -> impl IntoView {
    let go_back = || {
        #[cfg(target_arch = "wasm32")]
        {
            if let Some(win) = web_sys::window() {
                if let Ok(history) = win.history() {
                    let _ = history.back();
                }
            }
        }
    };

    view! {
        <div class="flex items-center justify-center min-h-screen px-4 text-base-content">
            <div class="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">

                <h1 class="text-7xl font-extrabold text-primary">404</h1>

                <h2 class="mt-4 text-2xl font-semibold text-base-content/70">
                    "Page Not Found"
                </h2>

                <p class="mt-2 text-base-content/70">
                    "The page you’re looking for doesn’t exist or has been moved."
                </p>

                <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">

                    <a href="/" class="btn btn-primary">
                        "Go Home"
                    </a>

                    <button on:click=move |_| go_back() class="btn btn-outline">
                        "Go Back"
                    </button>

                </div>

                <div class="mt-10 text-xs text-base-content/50">
                    "Error code: 404_NOT_FOUND"
                </div>

            </div>
        </div>
    }
}
