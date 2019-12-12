#!/bin/sh

_SUBSTRUCTION () {
    echo | awk "{printf \"%.3f\", $1-$2}"
}

_MESSAGE_FORMATTER () {
    awk '{printf "| %-28s | %9s |\n",$1" "$2,$3}'
}

LOG_TABLE () {
    time_begin=$(date +%s -d "$(awk '/.*DEBUG Hexo version/{print $1}' build.log)")
    time_process_start=$(date +%s.%3N -d "$(awk '/.*INFO  Start processing/{print $1}' build.log)")
    time_render_start=$(date +%s.%3N -d "$(awk '/.*INFO  Files loaded in/{print $1}' build.log)")
    time_render_finish=$(date +%s.%3N -d "$(awk '/.*INFO.*generated in /{print $1}' build.log)")
    time_database_saved=$(date +%s.%3N -d "$(awk '/.*DEBUG Database saved/{print $1}' build.log)")

    memory_usage=$(awk '/.*Maximum resident set size/{print $6}' build.log)

    echo "Load Plugin/Scripts/Database $(_SUBSTRUCTION $time_process_start $time_begin)s" | _MESSAGE_FORMATTER
    echo "Process Source $(_SUBSTRUCTION $time_render_start $time_process_start)s" | _MESSAGE_FORMATTER
    echo "Render Files $(_SUBSTRUCTION $time_render_finish $time_render_start)s" | _MESSAGE_FORMATTER
    echo "Save Database $(_SUBSTRUCTION $time_database_saved $time_render_finish)s" | _MESSAGE_FORMATTER
    echo "Total time $(_SUBSTRUCTION $time_database_saved $time_begin)s" | _MESSAGE_FORMATTER
    echo "Memory Usage(RSS) $(echo | awk "{printf \"%.3f\", $memory_usage/1024}")MB" | _MESSAGE_FORMATTER

    total_time=$(_SUBSTRUCTION $time_database_saved $time_begin | xargs -0 printf "%.0f")
    line_number=$(wc -l build.log | cut -d" " -f1)

    if [ $total_time -lt 10 ] || ([ $line_number -lt 300 ] && [ $1 != "HOT" ]); then
        echo "--------------------------------------------"
        echo -e '\033[41;37m !! Build failed !! \033[0m'
        head -n 400 build.log
        exit 1
    fi

    if [ $total_time -gt 40 ]; then
        echo "--------------------------------------------"
        echo -e '\033[41;37m !! Performance regression detected !! \033[0m'
        exit 1
    fi
}

echo "============== Hexo Benchmark =============="

echo "- Set up dummy Hexo site"
cd $TRAVIS_BUILD_DIR
cd ..
git clone https://github.com/hexojs/hexo-theme-unit-test.git --depth=1 --quiet
cd hexo-theme-unit-test

echo "- Install hexo-theme-landscape"
git clone https://github.com/hexojs/hexo-theme-landscape --depth=1 --quiet themes/landscape

echo "- npm install"
npm install --silent

echo "- Import 300 posts"
git clone https://github.com/SukkaLab/hexo-many-posts.git source/_posts/hexo-many-posts --depth=1 --quiet
rm -rf source/_posts/hexo-many-posts/.git/

echo "- Replace node_modules/hexo"
rm -rf node_modules/hexo
ln -sf $TRAVIS_BUILD_DIR node_modules/hexo

echo "- Start test run"

echo "------------- Cold processing --------------"
{ /usr/bin/time -v npx --no-install hexo g --debug > build.log 2>&1 ; } 2> build.log
LOG_TABLE

echo "-------------- Hot processing --------------"
{ /usr/bin/time -v npx --no-install hexo g --debug > build.log 2>&1 ; } 2> build.log
LOG_TABLE "HOT"

echo "--------- Another Cold processing ----------"
npx --no-install hexo clean > build.log
{ /usr/bin/time -v npx --no-install hexo g --debug > build.log 2>&1 ; } 2> build.log
LOG_TABLE

echo "--------------------------------------------"
rm -rf build.log

cd $TRAVIS_BUILD_DIR
