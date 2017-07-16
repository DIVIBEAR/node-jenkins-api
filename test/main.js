var chai = require('chai'),
    expect = chai.expect;

var chaiLike = require('chai-like');
var chaiThings = require('chai-things');
chai.use(chaiLike);
chai.use(chaiThings);

var jenkinsapi = require('../lib/main');
var JENKINS_URL="http://localhost:8080";

var JOB_NAME_TEST = "asrwqersfdzdraser-test";
var JOB_NAME_NEW = "asrwqersfdzdraser-test-new";
var JOB_NAME_COPY = "asrwqersfdzdraser-test-copy";

var DEVELOPMENT_PROJECT_XML_CONFIG = '<?xml version="1.0" encoding="UTF-8"?><project><description>development</description></project>';
var ORIGINAL_DESCRIPTION = 'development';
var REPLACED_DESCRIPTION = 'feature';

function log() {
  //console.log.apply(console, arguments);
}

describe('Node Jenkins API', function() {

  it('Should exist', function() {
    expect(jenkinsapi).not.to.be.undefined;
    expect(jenkinsapi.init).to.be.a('function');
  });


  // TODO handle this better as a test setup
  var jenkins = jenkinsapi.init(JENKINS_URL);


  it('Should create the connection object', function() {
    expect(jenkins).not.to.be.undefined;
  });


  // TODO handle this better - as a test setup
  //it('Should prepare for the tests', function(done) {
    expect(jenkins.delete_job).to.be.a('function');
    expect(jenkins.all_jobs).to.be.a('function');

    jenkins.delete_job(JOB_NAME_NEW, function(error, data){
      //log('delete_job', JOB_NAME_NEW, {error, data});

      jenkins.delete_job(JOB_NAME_COPY, function(error, data){
        //log('delete_job', JOB_NAME_COPY, {error, data});

        jenkins.create_job(JOB_NAME_TEST, DEVELOPMENT_PROJECT_XML_CONFIG, function(error, data) {
          //log('create_job', JOB_NAME_TEST, {error, data});

          jenkins.all_jobs(function(error, data) {
            //log('all_jobs', {error, data});

            expect(error).to.be.null;
            expect(data).to.be.an('array').that.contains.something.like({name: JOB_NAME_TEST});

            //done();

          }); // all_jobs
        }); // create_job
      }); // delete_job
    }); // delete_job
  //});


  it('Should show all jobs', function(done) {
    expect(jenkins.all_jobs).to.be.a('function');

    jenkins.all_jobs(function(error, data) {
      log('all_jobs', {error, data});

      expect(error).to.be.null;
      expect(data).to.be.an('array').that.contains.something.like({name: JOB_NAME_TEST});
      done();
    }); // all_jobs
  });


  it('Should read xml of existing job', function(done) {
    expect(jenkins.get_config_xml).to.be.a('function');

    jenkins.get_config_xml(JOB_NAME_TEST, function(error, data) {
      log('get_config_xml', JOB_NAME_NEW, {error, data});
      expect(error).to.be.null;
      expect(data).to.be.a('string').that.contains(ORIGINAL_DESCRIPTION);
      done();
    }); // get_config_xml
  });


  it('Should show job info', function(done) {
    expect(jenkins.job_info).to.be.a('function');

    // Missing jobName parameter
    try {
      jenkins.job_info(function(error, data) { }); // job_info
    } catch (error) {
      expect(error).not.to.be.null;
    }

    jenkins.job_info(JOB_NAME_TEST, function(error, data) {
      expect(error).to.be.null;
      expect(data).to.be.an('object').like({name: JOB_NAME_TEST, description: ORIGINAL_DESCRIPTION});
      done();
    }); // job_info
  });


  it('Should create and delete job', function(done) {
    expect(jenkins.create_job).to.be.a('function');
    expect(jenkins.delete_job).to.be.a('function');

    jenkins.create_job(JOB_NAME_NEW, DEVELOPMENT_PROJECT_XML_CONFIG, function(error, data) {
      expect(error).to.be.null;
      expect(data).to.be.an('object').like({name: JOB_NAME_NEW});

      jenkins.all_jobs(function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.an('array').that.contains.something.like({name: JOB_NAME_NEW});

        jenkins.delete_job(JOB_NAME_NEW, function(error, data) {
          expect(error).to.be.null;
          expect(data).to.be.an('object').like({name: JOB_NAME_NEW});

          jenkins.all_jobs(function(error, data) {
            expect(error).to.be.null;
            expect(data).to.be.an('array').that.does.not.contain.something.like({name: JOB_NAME_NEW});

            done();

          }); // all_jobs
        }); // delete_job
      }); // all_jobs
    }); // create_job
  });


  it('Should copy job', function(done) {
    expect(jenkins.copy_job).to.be.a('function');

    jenkins.copy_job(JOB_NAME_TEST, JOB_NAME_COPY, function(data) {
      return data.replace(ORIGINAL_DESCRIPTION, REPLACED_DESCRIPTION);
    }, function(error, data) {
      expect(error).to.be.null;
      expect(data).to.be.an('object').like({name: JOB_NAME_COPY});

      jenkins.get_config_xml(JOB_NAME_COPY, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.a('string').that.contains(REPLACED_DESCRIPTION);

        jenkins.delete_job(JOB_NAME_COPY, function(error, data) {
          expect(error).to.be.null;
          done();
        }); // delete_job
      }); // get_config_xml
    }); // copy_job
  });


  it('Should update job config', function(done) {
    expect(jenkins.update_config).to.be.a('function');

    jenkins.copy_job(JOB_NAME_TEST, JOB_NAME_COPY, function(data) {
      return data;
    }, function(error, data) {
      expect(error).to.be.null;

      jenkins.update_config(JOB_NAME_COPY, function(data) {
        return data.replace(ORIGINAL_DESCRIPTION, REPLACED_DESCRIPTION);
      }, function(error, data) {
        expect(error).to.be.null;
        expect(data).to.be.an('object').like({name: JOB_NAME_COPY});

        jenkins.get_config_xml(JOB_NAME_COPY, function(error, data) {
          expect(error).to.be.null;
          expect(data).to.be.a('string').that.contains(REPLACED_DESCRIPTION);

          jenkins.delete_job(JOB_NAME_COPY, function(error, data) {
            expect(error).to.be.null;
            done();
          }); // delete_job
        }); // get_config_xml
      }); // update_config
    }); // copy_job
  });


  var TEST_VIEW_NAME = 'ewoiurewlkjr-test-view';
  var TEST_VIEW_MODE = 'ewoiurewlkjr-test-view-mode';
  var TEST_VIEW_CONF = {
    "name": TEST_VIEW_NAME,
    "description": "This is the " + TEST_VIEW_NAME + " job-in-jenkins View",
    "statusFilter": "",
    "job-in-jenkins": true,
    "useincluderegex": true,
    "includeRegex": "prefix.*",
    "columns": [{"stapler-class": "hudson.views.StatusColumn", "$class": "hudson.views.StatusColumn"}, {"stapler-class": "hudson.views.WeatherColumn", "$class": "hudson.views.WeatherColumn"}, {"stapler-class": "hudson.views.JobColumn", "$class": "hudson.views.JobColumn"}, {"stapler-class": "hudson.views.LastSuccessColumn", "$class": "hudson.views.LastSuccessColumn"}, {"stapler-class": "hudson.views.LastFailureColumn", "$class": "hudson.views.LastFailureColumn"}, {"stapler-class": "hudson.views.LastDurationColumn", "$class": "hudson.views.LastDurationColumn"}, {"stapler-class": "hudson.views.BuildButtonColumn", "$class": "hudson.views.BuildButtonColumn"}]
  };

  // TODO handle this better as a test setup
  jenkins.delete_view(TEST_VIEW_NAME, function(){});


  it('Should CRUD a view', function(done) {
    expect(jenkins.create_view).to.be.a('function');
    expect(jenkins.all_views).to.be.a('function');
    expect(jenkins.update_view).to.be.a('function');
    expect(jenkins.delete_view).to.be.a('function');
    expect(jenkins.all_jobs_in_view).to.be.a('function');

    jenkins.create_view(TEST_VIEW_NAME, function(error, data) {
      log('create_view', TEST_VIEW_NAME, {error, data});
      expect(error).to.be.null;
      expect(data).to.be.an('object').like({name: TEST_VIEW_NAME});

      jenkins.all_views(function(error, data) {
        log('all_views', {error, data});
        expect(error).to.be.null;
        expect(data).to.be.an('array').that.contains.something.like({name: TEST_VIEW_NAME});

        jenkins.update_view(TEST_VIEW_NAME, TEST_VIEW_CONF, function(error, data) {
          log('update_view', TEST_VIEW_NAME, TEST_VIEW_CONF, {error, data});
          expect(error).to.be.null;
          expect(data).to.be.an('object').like({name: TEST_VIEW_NAME});

          jenkins.delete_view(TEST_VIEW_NAME, function(error, data) {
            log('delete_view', TEST_VIEW_NAME, {error, data});
            expect(error).to.be.null;
            expect(data).to.be.an('object').like({name: TEST_VIEW_NAME});

            jenkins.all_views(function(error, data) {
              log('all_views', {error, data});
              expect(error).to.be.null;
              expect(data).to.be.an('array').that.does.not.contain.something.like({name: TEST_VIEW_NAME});

              done();

            }); // all_views
          }); // delete_view
        }); // update_view
      }); // all_views
    }); // create_view
  });


});
