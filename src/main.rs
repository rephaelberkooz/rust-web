use actix_files::Files;
use actix_files::NamedFile;
// For serving files
use actix_web::{middleware, web, App, HttpServer, Result};
use std::path::PathBuf;
mod say_hi;

async fn serve_index() -> Result<NamedFile> {
    // Path to your index.html file
    let path: PathBuf = "./static/index.html".into(); // Adjust this to your file location
    Ok(NamedFile::open(path)?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    log::info!("starting HTTP server at http://localhost:8080");

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .wrap(say_hi::SayHi)
            // Route for serving /index.html
            .route("/index.html", web::get().to(serve_index))
            // Serve static files for the `/static/` folder (e.g., index.js)
            .service(Files::new("/static", "./static").show_files_listing())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
