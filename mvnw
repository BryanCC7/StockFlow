#!/bin/sh
# Maven Wrapper script (maven-wrapper 3.3.2, distribution 3.9.9)
set -e
MAVEN_WRAPPER_JAR=".mvn/wrapper/maven-wrapper.jar"
MAVEN_WRAPPER_PROPERTIES=".mvn/wrapper/maven-wrapper.properties"
if [ -z "$JAVA_HOME" ]; then
  JAVA_EXE="java"
else
  JAVA_EXE="$JAVA_HOME/bin/java"
fi
exec "$JAVA_EXE" -classpath "$MAVEN_WRAPPER_JAR" "-Dmaven.multiModuleProjectDirectory=$PWD" org.apache.maven.wrapper.MavenWrapperMain "$@"
