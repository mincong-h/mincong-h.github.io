Jekyll::Hooks.register :site, :post_write do |site|
    Jekyll.logger.info "Updating blog posts to BlogSearch..."

    # See more variables in https://jekyllrb.com/docs/variables/
    site.posts.docs.each { |post|
        # Jekyll.logger.info post.data["date"].class
        Jekyll.logger.info post.data["date"].strftime("%FT%T%:z")
        Jekyll.logger.info post.data["title"].strip
    }
end
