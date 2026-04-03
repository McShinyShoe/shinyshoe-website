use leptos::prelude::*;
use leptos_meta::{provide_meta_context, Link, MetaTags, Stylesheet, Title};
use leptos_router::{
    components::{Route, Router, Routes},
    StaticSegment,
};

use crate::{
    components::{hero::Hero, navbar::NavBar},
    pages::err404::Err404,
};

mod components;
mod pages;

pub fn shell(options: LeptosOptions) -> impl IntoView {
    view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <script>r#"
                    const saved = localStorage.getItem("theme");
                    if (saved) {
                        document.documentElement.setAttribute("data-theme", saved);
                    }
                "#</script>
                <Link rel="icon" type_="image/svg+xml" href="/favicon.svg"/>
                <Link rel="icon" href="/favicon.ico"/>
                <AutoReload options=options.clone()/>
                <HydrationScripts options/>
                <MetaTags/>
            </head>
            <body>
                <App/>
            </body>
        </html>
    }
}

#[component]
pub fn App() -> impl IntoView {
    // Provides context that manages stylesheets, titles, meta tags, etc.
    provide_meta_context();

    view! {
        <Stylesheet id="leptos" href="/pkg/shinyshoe-website.css"/>

        // sets the document title
        <Title text="ShinyShoe Website"/>


        // content for this welcome page
        <Router>
            <NavBar/>

            <main class="bg-base-300">
                <Routes fallback=|| Err404>
                    <Route path=StaticSegment("") view=HomePage/>
                </Routes>
            </main>
        </Router>
    }
}

/// Renders the home page of your application.
#[component]
fn HomePage() -> impl IntoView {
    view! {
    <Hero>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 class="text-white text-5xl md:text-6xl font-bold">
                Welcome
            </h1>
            <p class="text-white text-lg md:text-xl mt-3 opacity-90">
                hello world
            </p>
        </div>
    </Hero>
    }
}
