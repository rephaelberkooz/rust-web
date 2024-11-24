use actix_files::NamedFile;
use actix_files::{file_extension_to_mime, Files};
use actix_web::body::MessageBody;
use actix_web::http::header::HeaderName;
// For serving files
use actix_web::{
    dev::{ServiceRequest, ServiceResponse},
    middleware, web, App, HttpServer, Result,
};
use std::path::PathBuf;
use std::str::FromStr;
mod say_hi;

async fn serve_index() -> Result<NamedFile> {
    // Path to your index.html file
    let path: PathBuf = "./static/index.html".into(); // Adjust this to your file location
    Ok(NamedFile::open(path)?)
}
//
//async fn update_mime(
//    req: ServiceRequest,
//    &serv: Service,
//) -> Future<Output = Result<ServiceResponse<MessageBody>, Error>> {
//}

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
