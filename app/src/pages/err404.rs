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
        <section class="sh-hero err404">
            <div class="sh-hero__content">
                <span class="sh-badge sh-badge--danger">"Error 404"</span>
                <h1 class="sh-hero__title">"Page not found"</h1>
                <p class="sh-hero__desc">
                    "The page you’re looking for doesn’t exist or has been moved."
                </p>
                <div class="sh-hero__actions">
                    <button type="button" class="sh-btn sh-btn--secondary" on:click=move |_| go_back()>
                        <span class="sh-icon" data-icon="arrow-left" aria-hidden="true"></span>
                        "Go back"
                    </button>
                    <a href="/" class="sh-btn sh-btn--primary">
                        "Go home"
                        <span class="sh-icon" data-icon="arrow-right" aria-hidden="true"></span>
                    </a>
                </div>
            </div>
        </section>
    }
}
