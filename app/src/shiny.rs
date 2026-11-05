//! Bridge to the Shiny design system's script (`public/shiny/bundle.js`, `window.Shiny`).
//! Everything here is a no-op on the server, and in the browser when the script didn't load.

use leptos::prelude::*;
use leptos_router::hooks::use_location;

#[cfg(target_arch = "wasm32")]
use web_sys::{
    js_sys::{Function, Object, Reflect},
    wasm_bindgen::{JsCast, JsValue},
};

#[cfg(target_arch = "wasm32")]
thread_local! {
    static TEARDOWN: std::cell::RefCell<Option<Function>> = const { std::cell::RefCell::new(None) };
}

/// Looks up `Shiny.<name>`, returning `Shiny` itself (the `this` to call it with) and the function.
#[cfg(target_arch = "wasm32")]
fn method(name: &str) -> Option<(JsValue, Function)> {
    let window = web_sys::window()?;
    let shiny = Reflect::get(&window, &JsValue::from_str("Shiny")).ok()?;
    let func = Reflect::get(&shiny, &JsValue::from_str(name)).ok()?;
    Some((shiny, func.dyn_into().ok()?))
}

/// Starts the drifting stars in a `canvas.sh-stars`. They keep running across page changes,
/// which is why [`rewire`] leaves them out.
pub fn starfield(canvas: &web_sys::Element) {
    #[cfg(target_arch = "wasm32")]
    if let Some((shiny, starfield)) = method("starfield") {
        let _ = starfield.call1(&shiny, canvas);
    }
    #[cfg(not(target_arch = "wasm32"))]
    let _ = canvas;
}

/// Undoes the last `Shiny.init()` and runs it again over the page as it is now: navbar docking,
/// sparks, card spotlight, text rotate and the rest.
pub fn rewire() {
    #[cfg(target_arch = "wasm32")]
    TEARDOWN.with(|teardown| {
        if let Some(previous) = teardown.borrow_mut().take() {
            let _ = previous.call0(&JsValue::NULL);
        }
        let Some((shiny, init)) = method("init") else {
            return;
        };
        let options = Object::new();
        let _ = Reflect::set(&options, &JsValue::from_str("stars"), &JsValue::FALSE);
        if let Ok(next) = init.call1(&shiny, &options) {
            *teardown.borrow_mut() = next.dyn_into().ok();
        }
    });
}

/// Rewires Shiny once hydration is done and again after every navigation,
/// so whichever page just rendered gets its behaviours.
#[component]
pub fn ShinyWiring() -> impl IntoView {
    let location = use_location();

    Effect::new(move |_| {
        location.pathname.track();
        rewire();
    });
}
