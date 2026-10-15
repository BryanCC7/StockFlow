@REM Maven Wrapper script for Windows (maven-wrapper 3.3.2, distribution 3.9.9)
@ECHO OFF
setlocal
set MAVEN_WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
if defined JAVA_HOME (
  set JAVA_EXE="%JAVA_HOME%\bin\java.exe"
) else (
  set JAVA_EXE=java
)
%JAVA_EXE% -classpath "%MAVEN_WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%CD%" org.apache.maven.wrapper.MavenWrapperMain %*
