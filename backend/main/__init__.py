import json
import os
from flask import render_template, Blueprint, request, send_from_directory, send_file
from werkzeug.utils import secure_filename
from backend.lib.knowledge_base import KNOWLEDGE
from backend.lib.event_manager import EVENT
from backend.lib.contribution import CONTRIBUTION
from backend.lib.config import CONFIG
from backend.lib.data_helper import save_json

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
    CONTRIBUTION.record(data['user'], data['id'])
    return 'success'


@main.route('/update', methods=['GET'])
def update():
    file = request.args['file']
    EVENT.update_event_file(file)
    return 'success'


@main.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return 'Error! No file uploaded'
    file = request.files['file']
    if file.filename == '':
        return 'Error! No file uploaded'
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(CONFIG.upload_folder, filename))
        return filename


@main.route('/progress', methods=['GET'])
def count():
    labeled, unlabeled = EVENT.count()
    return {'labeled': labeled, 'unlabeled': unlabeled}


@main.route('/getContribution', methods=['GET'])
def contribution():
    return {'today': CONTRIBUTION.today(), 'total': CONTRIBUTION.total()}


@main.route('/downloadLabeled', methods=['GET'])
def download_latest_excel():
    if not os.path.exists(CONFIG.event_labeled):
        save_json([], CONFIG.event_labeled)
    return send_from_directory(os.path.abspath(CONFIG.event_folder), CONFIG.event_labeled_file_name, as_attachment=True)


@main.route('/', defaults={'path': ''})
@main.route('/<path:path>')
def index(path):
    return render_template('index.html')
