use leptos::prelude::*;

#[component]
pub fn Err404() -> impl IntoView {
    let go_back = move || {
        window().history().unwrap().back().unwrap();
    };

    view! {
        <div class="bg-base-300 text-white flex items-center justify-center min-h-screen px-4">
            <div class="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 class="text-7xl font-extrabold text-primary">404</h1>

                <h2 class="mt-4 text-2xl font-semibold text-muted-foreground">
                    "Page Not Found"
                </h2>

                <p class="mt-2 text-muted-foreground">
                    "The page you’re looking for doesn’t exist or has been moved."
                </p>

                <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
                    "Go Home"
                </a>

                <button onclick="history.back()" class="px-5 py-2.5 border border-gray-700 hover:bg-gray-800 rounded-lg font-medium transition">
                    "Go Back"
                </button>
                </div>

                <div class="mt-10 text-xs text-gray-600">
                    "Error code: 404_NOT_FOUND"
                </div>
            </div>
        </div>
    }
}
