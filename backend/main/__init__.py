import json
from flask import render_template, Blueprint, request
from backend.lib.knowledge_base import KNOWLEDGE
from backend.lib.event_manager import EVENT

main = Blueprint('main', __name__, template_folder='templates', static_folder='static', static_url_path="/static")


@main.route('/searchFood', methods=['GET'])
def search_food():
    query = request.args['query']
    return json.dumps(KNOWLEDGE.search_food(query), ensure_ascii=False)


@main.route('/searchPollutant', methods=['GET'])
def search_pollutant():
    query = request.args['query']
    return json.dumps(KNOWLEDGE.search_pollutant(query), ensure_ascii=False)


@main.route('/getPopulationCategory', methods=['GET'])
def get_population_category():
    return KNOWLEDGE.population


@main.route('/getNextEventData', methods=['GET'])
def get_next_event_data():
    return EVENT.fetch_event()


@main.route('/postEvent', methods=['POST'])
def post_event():
    data = request.get_json()
    EVENT.post_event(data['id'], data['events'])
    return 'success'
