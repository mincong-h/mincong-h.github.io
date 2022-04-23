Jekyll::Hooks.register :site, :post_write do |site|
  Jekyll.logger.info "Updating blog posts to BlogSearch..."
end
