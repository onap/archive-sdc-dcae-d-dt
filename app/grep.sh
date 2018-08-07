#!/bin/bash
clear

echo "Create grep-logs folder for txt files"
mkdir -p grep-logs

echo "Producing AIC-grep.txt"
grep -riHI --exclude=AIC-grep.txt "aic" ./ | grep -vI --exclude=AIC-grep.txt "AiC" | grep -vI --exclude=AIC-grep.txt "aaico" >> grep-logs/AIC-grep.txt

echo "Producing amdocs-grep.txt"
grep -riHI --exclude=amdocs-grep.txt "amdocs" >> grep-logs/amdocs-grep.txt

echo "Producing att-grep.txt"
grep -riH --exclude=att-grep.txt " att " ./ | grep -vI --exclude=att-grep.txt "collector\.log" | grep -vI --exclude=att-grep.txt "Canvas.prototype.zoom = function(newScale, center) " >> grep-logs/att-grep.txt

echo "Producing attuid-grep.txt"
grep -rHI --exclude=attuid-grep.txt " [a-zA-Z][a-zA-Z][0-9][0-9][0-9][0-9a-zA-Z] " >> grep-logs/attuid-grep.txt

echo "Producing comatt-grep.txt"
grep -riHI --exclude=comatt-grep.txt "com.att" >> grep-logs/comatt-grep.txt

echo "Producing ecomp-grep.txt"
grep -riHI --exclude=ecomp-grep.txt "ecomp" | grep -viI --exclude=ecomp-grep.txt "opene" >> grep-logs/ecomp-grep.txt

echo "Producing nfod-grep.txt"
grep -riHI --exclude=nfod-grep.txt 'Network On Demand' >> grep-logs/nfod-grep.txt

echo "Producing ngeag-grep.txt"
grep -riHI --exclude=ngeag-grep.txt 'ngeag' >> grep-logs/ngeag-grep.txt

echo "Producing public12-ip-grep.txt"
grep -rEI --exclude=public12-ip-grep.txt '12\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' >> grep-logs/public12-ip-grep.txt

echo "Producing public135-ip-grep.txt"
grep -rEI --exclude=public135-ip-grep.txt '135\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' >> grep-logs/public135-ip-grep.txt

echo "Producing public172-99-ip-grep.txt"
grep -riHI --exclude=public172-99-ip-grep.txt "172\.99" >> grep-logs/public172-99-ip-grep.txt

echo "Producing research-com-att-grep.txt"
grep -riHI --exclude=research-com-att-grep.txt "research\.att\.com" >> grep-logs/research-com-att-grep.txt

echo "Producing sbc-grep.txt"
grep -riHI --exclude=sbc-grep.txt "sbc" >> grep-logs/sbc-grep.txt

echo "Producing sbc-com-grep.txt"
grep -riHI --exclude=sbc-com-grep.txt "sbc\.com" >> grep-logs/sbc-com-grep.txt

echo "Producing ucpe-grep.txt"
grep -riHI --exclude=ucpe-grep.txt "ucpe" >> grep-logs/ucpe-grep.txt

echo "Finished greppppp!!!!"

