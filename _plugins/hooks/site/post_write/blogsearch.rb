require 'net/http'
require 'uri'
require 'json'

Jekyll::Hooks.register :site, :post_write do |site|
    jekyll_env = ENV["JEKYLL_ENV"]
    blogsearch_enabled_env = ENV["BS_ENABLED"]
    blogsearch_enabled = jekyll_env == "prod" || blogsearch_enabled_env == "true"

    if !blogsearch_enabled
        Jekyll.logger.info "Blogsearch is disabled"
        next
    end

    Jekyll.logger.info "Updating blog posts to BlogSearch..."
    username = ENV["BS_USERNAME"]
    password = ENV["BS_PASSWORD"]

    site_info = Net::HTTP.get URI('https://bs.nanosearch.io')
    Jekyll.logger.info site_info

    # See more variables in https://jekyllrb.com/docs/variables/
    site.posts.docs.each { |post|
        url = post.url
        title = post.data["title"]
        content = post.content
        Jekyll.logger.info "Indexing post: " + title + " (" + post.id + ")"

        pos = post.id.rindex('/') + 1
        postId = post.id[pos..-1]  # hack: remove prefix
        uri = URI.parse('https://bs.nanosearch.io/api/sites/mincong.io/posts/' + postId)
        Jekyll.logger.info uri

        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true

        headers = {"Content-Type": "application/json"}
        body = {"title" => title, "url" => url, "content" => content}.to_json

        request = Net::HTTP::Put.new(uri.request_uri, headers)
        request.basic_auth username, password
        request.body = body

        response = http.request(request)

        Jekyll.logger.info response.code + " " + response.body
    }
end
