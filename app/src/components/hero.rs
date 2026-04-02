use leptos::prelude::*;

#[component]
pub fn Hero(#[prop(into, optional)] src: Option<String>, children: Children) -> impl IntoView {
    let style = format!("background-image: url('{}');", src.unwrap_or_else(|| "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1920&auto=format&fit=crop".to_string()));

    return view! {
    <div
      class="relative h-screen w-full bg-cover bg-center overflow-hidden"
      style=style
    >
        {children()}
    </div>
    };
}
