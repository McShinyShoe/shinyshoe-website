use leptos::prelude::*;

#[component]
pub fn Footer() -> impl IntoView {
    view! {
        <footer class="sh-footer site-footer">
            <div class="sh-footer__brand">
                <img src="/images/shiny-wordmark-smoke.svg" alt="ShinyShoe" width="400" height="159"/>
                <p>"Just a goober doing goofy things."</p>
            </div>

            <nav aria-labelledby="footer-projects">
                <h2 class="sh-footer__title" id="footer-projects">"Projects"</h2>
                <a href="/mods">"Mods"</a>
                <a href="/plugins">"Plugins"</a>
            </nav>

            <nav aria-labelledby="footer-elsewhere">
                <h2 class="sh-footer__title" id="footer-elsewhere">"Elsewhere"</h2>
                <a href="https://github.com/McShinyShoe" target="_blank" rel="noopener">"GitHub"</a>
                <a href="https://lestallum.shinyshoe.net" target="_blank" rel="noopener">"Lestallum"</a>
            </nav>

            <div class="sh-footer__bottom">
                <span>"© 2026 ShinyShoe"</span>
                <a
                    href="https://github.com/McShinyShoe/shinyshoe-website/blob/master/LICENSE"
                    target="_blank"
                    rel="noopener"
                >
                    "MIT license"
                </a>
            </div>
        </footer>
    }
}
