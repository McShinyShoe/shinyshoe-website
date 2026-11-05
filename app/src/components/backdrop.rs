use leptos::{html, prelude::*};

use crate::shiny;

#[component]
pub fn Backdrop() -> impl IntoView {
    let stars = NodeRef::<html::Canvas>::new();

    Effect::new(move |_| {
        if let Some(canvas) = stars.get() {
            shiny::starfield(&canvas);
        }
    });

    view! {
        <div class="sh-backdrop" aria-hidden="true">
            <i class="sh-aurora sh-aurora--1"></i>
            <i class="sh-aurora sh-aurora--2"></i>
            <i class="sh-aurora sh-aurora--3"></i>
            <canvas class="sh-stars" node_ref=stars></canvas>
        </div>
    }
}
