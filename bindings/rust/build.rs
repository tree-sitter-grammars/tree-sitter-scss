fn main() {
    let src_dir = std::path::Path::new("src");

    let mut c_config = cc::Build::new();
    if cfg!(target_env = "msvc") {
        c_config.flag("/wd4100");
    } else {
        c_config.flag("-Wno-unused-parameter");
    }
    c_config.std("c11").include(src_dir);

    #[cfg(target_env = "msvc")]
    c_config.flag("-utf-8");

    let parser_path = src_dir.join("parser.c");
    c_config.file(&parser_path);
    println!("cargo:rerun-if-changed={}", parser_path.to_str().unwrap());

    let scanner_path = src_dir.join("scanner.c");
    c_config.file(&scanner_path);
    println!("cargo:rerun-if-changed={}", scanner_path.to_str().unwrap());

    c_config.compile("tree-sitter-scss");
}
