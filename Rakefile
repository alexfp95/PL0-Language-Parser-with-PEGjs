task :default => :web

desc "Compile pl0.pegjs browser version"
task :web do
  sh "pegjs -e pl0 lib/pl0.pegjs lib/pl0.js"
end

desc "Compile pl0.pegjs node version"
task :node do
  sh "pegjs lib/pl0.pegjs lib/pl0node.js"
end

desc "run tests/input5.pl0 and leaves the input in file 'salida'"
task :test => [ :node ] do
  sh "./mainfromfile.js | tee salida"
end

desc "Shows the pl0 peg without semantic actions"
task :grammar do
  sh "pegjs-strip lib/pl0.pegjs | egrep -v -e '^\\s*$'"
end
