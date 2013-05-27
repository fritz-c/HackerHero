require 'securerandom'
random_string = ""
500.times do
  random_string += "#{SecureRandom.hex[0,15]} #{SecureRandom.hex[0,15]}<br/>"
end
puts random_string