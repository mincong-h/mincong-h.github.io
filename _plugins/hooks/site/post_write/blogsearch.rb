require 'net/http'

Jekyll::Hooks.register :site, :post_write do |site|
    Jekyll.logger.info "Updating blog posts to BlogSearch..."
    Jekyll.logger.info ENV["JIMI_USERNAME"]
    Jekyll.logger.info ENV["JIMI_PASSWORD"]

    Jekyll.logger.info "Getting information from Jimi Data"
    uri = URI('https://search.jimidata.info')
    response = Net::HTTP.get_response(uri)
    Jekyll.logger.info response.code
    Jekyll.logger.info response.body
    Jekyll.logger.info "==="

    # See more variables in https://jekyllrb.com/docs/variables/
    site.posts.docs.each { |post|
        # Jekyll.logger.info post.data["date"].class
        Jekyll.logger.info post.data["date"].strftime("%FT%T%:z")
        Jekyll.logger.info post.data["title"].strip
        Jekyll.logger.info post.url
        Jekyll.logger.info "---"
    }
end
