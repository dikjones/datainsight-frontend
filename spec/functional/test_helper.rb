require_relative "../test_helper"

require "capybara"
require "capybara/dsl"
require "capybara/poltergeist"

require "rspec/core/shared_context"

RSpec.configure do |config|
  config.include Capybara::DSL
  Capybara.default_driver = :poltergeist
  Capybara.server do |app, port|
    require 'rack/handler/webrick'
    Rack::Handler::WEBrick.run(app, :Port => port, :AccessLog => [], :Logger => WEBrick::Log::new("log/capybara_test.log"))
  end
end

module CommonSetup
  extend RSpec::Core::SharedContext

  before(:all) do
    Capybara.app = Rack::URLMap.new(
        {
            "/performance" => App,
            "/performance/assets" => SprocketEnvHolder.instance.environment,
        }
    )
  end
end

class ClientAPIStubFromMap
  def initialize(map)
    @map = map
  end

  def method_missing(m, *args, &block)
    @map[m.to_sym]
  end
end

class StubApp < App
  def initialize(api = Insight::API::ClientStub.new)
    super
    @api = api
  end

  def api(config)
    @api
  end
end

module SessionAware
  def get_session
    Capybara.current_session
  end
end

class DashboardPage
  include SessionAware

  def visit
    get_session.visit "/performance/dashboard"
    get_session.wait_until do
      get_session.all("*[name()='svg']").count >= 4
    end
    self
  end

  def hourly_traffic_graph
    HourlyTrafficGraph.new
  end

  def visits_graph
    VisitsGraph.new
  end

  def format_success_graph
    FormatSuccessGraph.new
  end

  def wait_for_callout_boxes(n)
    get_session.wait_until do
      get_session.all(".callout-box").count == n
    end
  end

  def wait_for_callout_box
    wait_for_callout_boxes(1)
  end

  def wait_for_no_callout_box
    wait_for_callout_boxes(0)
  end

  def get_callout_boxes
    get_session.all(".callout-box")
  end
end

class HourlyTrafficGraph
  include SessionAware

  def columns
    get_session.find("#reach").all(".hover-panel")
  end
end

class VisitsGraph
  include SessionAware

  def area
    get_session.find("#visits .js-graph-area")
  end
end

class FormatSuccessGraph
  include SessionAware

  def circles
    get_session.find("#format-success").all(".format")
  end
end