use leptos::prelude::*;
use leptos_meta::{provide_meta_context, Link, MetaTags, Stylesheet, Title};
use leptos_router::{
    components::{Route, Router, Routes},
    StaticSegment,
};

use crate::{
    components::{backdrop::Backdrop, footer::Footer, navbar::NavBar},
    pages::{err404::Err404, home::HomePage},
    shiny::ShinyWiring,
};

mod components;
mod pages;
mod shiny;

pub fn shell(options: LeptosOptions) -> impl IntoView {
    view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="theme-color" content="#24273a"/>
                <Link rel="preload" href="/shiny/fonts/JetBrainsMono-Variable.woff2" as_="font" type_="font/woff2" crossorigin=""/>
                <link rel="stylesheet" href="/shiny/tokens.css"/>
                <link rel="stylesheet" href="/shiny/bundle.css"/>
                // before the hydration script, so window.Shiny exists by the time the app wires it
                <script src="/shiny/bundle.js" defer></script>
                <Link rel="icon" type_="image/svg+xml" href="/favicon.svg"/>
                <Link rel="icon" href="/favicon.ico"/>
                <AutoReload options=options.clone()/>
                <HydrationScripts options/>
                <MetaTags/>
            </head>
            <body class="sh-page">
                <App/>
            </body>
        </html>
    }
}

#[component]
pub fn App() -> impl IntoView {
    // gives context that manages stuff
    provide_meta_context();

    view! {
        <Stylesheet id="leptos" href="/pkg/shinyshoe-website.css"/>

        <Title text="ShinyShoe"/>

        <Router>
            <Backdrop/>
            <NavBar/>

            <main>
                <Routes fallback=|| Err404>
                    <Route path=StaticSegment("") view=HomePage/>
                </Routes>
            </main>

            <Footer/>
            <ShinyWiring/>
        </Router>
    }
}
