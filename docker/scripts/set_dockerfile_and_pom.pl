#!/usr/bin/perl

use strict;
use warnings;


my @lines;

#
### POM file
#

my $file = 'pom.xml';
### Read the pom.xml file.
open (POM, $file) or die "[ERROR] Cannot read the file '$file' : $!\n\n";
chomp (@lines = <POM>);
close (POM);

open (NEW, ">${file}") or die "[ERROR] Cannot write to the file '$file' : $!\n\n";
foreach my $line (@lines) {

	# Replace groupID
	if ($line =~ m|<groupId>org.onap.sdc</groupId>|) {
		$line =~ s|org.onap.sdc|com.att.sdc|;
	}

	# Remove the tags.
	if ($line =~ m|<tag>(.*)</tag>|) {

		if ($1 eq '${docker.tag}') {
			$line =~ s|\$\{docker.tag\}|\$\{project.version\}|;
		}
		else {
			next;
		}
	}

	print NEW "$line\n";
}
close (NEW);


#
### Dockerfie
#

my $dockerFile = 'Dockerfile';

open (FILE, $dockerFile) or die "[ERROR] Cannot read the file '$dockerFile' : $!\n\n";
chomp (@lines = <FILE>);
close (FILE);

open (NEW, ">${dockerFile}") or die "[ERROR] Cannot write to the file '$dockerFile' : $!\n\n";

foreach my $line (@lines) {
	# Replace the docker registry
	if ($line =~ m|FROM|) {
		$line =~ s|onap|dockercentral.it.att.com:5100/com.att.sdc|;
	}
	print NEW "$line\n";
}
close (NEW);
