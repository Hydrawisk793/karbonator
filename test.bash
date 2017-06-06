#!/bin/bash
#$1 : The name of module.
#$2 : The extension of module files.
#$3 : working directory path
#$4 : command.
#-- commands --
#mv : move files to specified directory.
#	$5 : new directory path

regEx='^'$1'(\.[a-z][a-z0-9\-]*)*\.'$2
arr=($(ls -1 $3))
for i in ${arr[@]}; do
	fileName=$i
	if [[ $fileName =~ $regEx ]]; then
		case "$4" in
			'mv')
				mv $fileName $5/$fileName
		esac
	fi
done

