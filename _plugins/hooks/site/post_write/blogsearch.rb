Jekyll::Hooks.register :site, :post_write do |site|
    Jekyll.logger.info "Updating blog posts to BlogSearch..."
    site.posts.docs.each { |post|
        Jekyll.logger.info post.data['title']
    }
end
