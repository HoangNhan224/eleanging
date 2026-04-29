const { Client } = require('@elastic/elasticsearch')
const esClient = new Client({ node: 'http://localhost:9200' })
const Course = require('../models/course')

async function syncDataToElasticsearch () {
  try {
    const courses = await Course.findAll()
    for (const course of courses) {
      const courseJSON = course.toJSON()
      const isExisting = await esClient.exists({
        index: 'courses',
        id: courseJSON.id
      })

      if (!isExisting) {
        await esClient.index({
          index: 'courses',
          id: courseJSON.id,
          body: courseJSON
        })
      }
    }
    console.log('Data synchronized to Elasticsearch')
  } catch (error) {
    console.error('Error syncing data to Elasticsearch:', error)
  }
}
syncDataToElasticsearch()

module.exports = {
  esClient
}
