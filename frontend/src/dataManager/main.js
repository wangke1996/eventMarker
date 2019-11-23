import React, {Component} from 'react';
import {Typography, Button, Popconfirm, Upload, Icon, message, Spin, Row, Col} from "antd";
import {wrapUrl} from "../lib/toolFunction";
import {downloadLabeled, update} from "../lib/getData";

const {Dragger} = Upload;
const {Title} = Typography;

export class DataManagerView extends Component {
    state = {
        file: '',
        loading: false,
    };
    onFileChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            this.setState({file: info.file.response});
        } else if (info.file.status === 'error')
            message.error(`${info.file.name} file upload failed.`);
    };
    onSubmit = () => {
        this.setState({loading: true});
        update(this.state.file, (res) => {
            if (res.response === 'success')
                message.success('已更新后台事件库');
            else
                message.error(res.response);
            this.setState({loading: false})
        })
    };

    render() {
        return (
            <Spin className='loadingSpin' size='large' tip='正在更新后台事件库' spinning={this.state.loading}>
                <Typography>
                    <Row type='flex' justify="space-around">
                        <Col span={8}>
                            <Title level={2} type='secondary'>下载已标注数据</Title>
                            <Button type='primary' className='large margin-top' onClick={downloadLabeled}>点此下载</Button>
                        </Col>
                        <Col span={8}>
                            <Title level={2} type='secondary'>更新后台事件库</Title>
                            <Dragger name='file' action={wrapUrl('upload', false)} multiple={false}
                                     onChange={(info) => this.onFileChange(info)}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox"/>
                                </p>
                                <p className="ant-upload-text">单击或拖拽上传事件文件</p>
                                <p className="ant-upload-hint">仅限事件抽取技术人员操作</p>
                            </Dragger>
                            <Popconfirm className='large margin-top' title="确认覆盖后台事件库？"
                                        onConfirm={this.onSubmit}><Button
                                type='danger'>确认上传</Button></Popconfirm>
                        </Col>
                    </Row>
                </Typography>
            </Spin>
        )
    }
}