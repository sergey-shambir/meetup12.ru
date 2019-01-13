const gulp = require('gulp');
const path = require('path');
const childprocess = require('child_process');
const runSequence = require('gulp4-run-sequence');

const DOCKER_IMAGE = 'sshambir/meetup12ru:master';
const SRC_PATH = __dirname;
const DIST_PATH = path.join(__dirname, '..', 'dist');

gulp.task('dist', (cb) => {
    gulp.src(`${SRC_PATH}/**/*`).pipe(gulp.dest(DIST_PATH));
    cb();
});

gulp.task('docker-build', (cb) => {
    childprocess.execSync(`docker build -t ${DOCKER_IMAGE} ..`, { stdio: 'inherit' });
    cb();
});

gulp.task('docker-push', (cb) => {
    childprocess.execSync(`docker push ${DOCKER_IMAGE}`, { stdio: 'inherit' });
    cb();
});

gulp.task('prerelease', (cb) => {
    runSequence('dist', 'docker-build', cb);
});

gulp.task('release', (cb) => {
    runSequence('dist', 'docker-build', 'docker-push', cb);
});

