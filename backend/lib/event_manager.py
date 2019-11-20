import os
from backend.lib.config import CONFIG
from backend.lib.data_helper import load_json, save_json


class EventManager(object):
    @staticmethod
    def load_unlabeled_event():
        event_all = load_json(CONFIG.event_all)
        if os.path.exists(CONFIG.event_labeled):
            event_labeled = load_json(CONFIG.event_labeled)
        else:
            event_labeled = []
        ids_labeled = set(map(lambda x: x[0]['news_id'], event_labeled))
        ids_all = set(map(lambda x: x['content']['id'], event_all))
        ids_unlabeled = ids_all - ids_labeled
        event_unlabeled = list(filter(lambda x: x['content']['id'] in ids_unlabeled, event_all))
        return event_unlabeled, event_labeled

    def __init__(self):
        self.event, self.event_labeled = self.load_unlabeled_event()
        self.event_buffer = []  # 存放已经被取走进行标注，但尚未提交标注结果的event

    def save_change(self):
        save_json(self.event_labeled, CONFIG.event_labeled)

    def fetch_event(self):
        if len(self.event) == 0:
            self.event = self.event_buffer
            self.event_buffer = []
        if len(self.event) == 0:
            return '已经完成标注！'
        target_event = self.event.pop()
        self.event_buffer.append(target_event)
        return target_event

    def remove_from_buffer(self, news_id):
        self.event_buffer = list(filter(lambda x: x['content']['id'] != news_id, self.event_buffer))

    def post_event(self, news_id, events):
        self.event_labeled.append(events)
        self.save_change()
        self.remove_from_buffer(news_id)

    def update_event_file(self, file):
        data = load_json(os.path.join(CONFIG.upload_folder, file))
        save_json(data, CONFIG.event_all)
        self.__init__()

    def count(self):
        unlabeled = len(self.event) + len(self.event_buffer)
        labeled = len(self.event_labeled)
        return labeled, unlabeled


EVENT = EventManager()
