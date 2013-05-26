#encoding: utf-8

require 'rubygems'
require 'mechanize'

DESIRABLE_COMMAND_LENGTH = 30
OUT_FILENAME = "terminal_commands.txt"

agent = Mechanize.new

agent.user_agent = 'Mozilla/5.0 (Windows; U; Windows NT 6.1; ja-JP; rv:1.9.2.23) Gecko/20110920'

File.open(OUT_FILENAME, 'a') do |file|
  (1..200).each do |counter|
    sleep(rand()*2.0)
    command = agent.get('http://www.commandlinefu.com/commands/random',[],nil,{'Accept-Language' => 'ja'}).search("div.command").text
    # puts command
    if command.length > DESIRABLE_COMMAND_LENGTH
      file.write("#{command}\n")
      puts "\ninserted!\n#{command}"
    end
  end
end