# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_09_23_094515) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "audits", force: :cascade do |t|
    t.integer "auditable_id"
    t.string "auditable_type"
    t.integer "associated_id"
    t.string "associated_type"
    t.integer "user_id"
    t.string "user_type"
    t.string "username"
    t.string "action"
    t.text "audited_changes"
    t.integer "version", default: 0
    t.string "comment"
    t.string "remote_address"
    t.string "request_uuid"
    t.datetime "created_at"
    t.index ["associated_type", "associated_id"], name: "associated_index"
    t.index ["auditable_type", "auditable_id", "version"], name: "auditable_index"
    t.index ["created_at"], name: "index_audits_on_created_at"
    t.index ["request_uuid"], name: "index_audits_on_request_uuid"
    t.index ["user_id", "user_type"], name: "user_index"
  end

  create_table "business_categories", force: :cascade do |t|
    t.integer "category", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_business_categories_on_category"
    t.index ["discarded_at"], name: "index_business_categories_on_discarded_at"
  end

  create_table "chat_users", force: :cascade do |t|
    t.integer "chat_id", null: false
    t.integer "user_id", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_id", "user_id"], name: "index_chat_users_on_chat_id_and_user_id", unique: true
    t.index ["create_id"], name: "index_chat_users_on_create_id"
    t.index ["update_id"], name: "index_chat_users_on_update_id"
  end

  create_table "chats", force: :cascade do |t|
    t.integer "event_id", null: false
    t.string "name", null: false
    t.integer "chat_type", null: false
    t.datetime "discarded_at"
    t.boolean "visible", default: true
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_chats_on_create_id"
    t.index ["discarded_at"], name: "index_chats_on_discarded_at"
    t.index ["event_id"], name: "index_chats_on_event_id"
    t.index ["update_id"], name: "index_chats_on_update_id"
  end

  create_table "companies", force: :cascade do |t|
    t.string "japanese_name", null: false
    t.string "english_name", null: false
    t.string "address", null: false
    t.string "deal_memo"
    t.string "company_memo"
    t.boolean "status", default: true
    t.boolean "is_forwarder", default: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_companies_on_discarded_at"
  end

  create_table "company_business_categories", force: :cascade do |t|
    t.datetime "discarded_at"
    t.integer "company_id", null: false
    t.integer "business_category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_category_id"], name: "index_company_business_categories_on_business_category_id"
    t.index ["company_id"], name: "index_company_business_categories_on_company_id"
    t.index ["discarded_at"], name: "index_company_business_categories_on_discarded_at"
  end

  create_table "containers", force: :cascade do |t|
    t.integer "event_id", null: false
    t.string "cntr_num"
    t.string "cntr_type"
    t.string "cntr_size"
    t.string "cntr_seal"
    t.string "cntr_remark"
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_containers_on_create_id"
    t.index ["discarded_at"], name: "index_containers_on_discarded_at"
    t.index ["event_id"], name: "index_containers_on_event_id"
    t.index ["update_id"], name: "index_containers_on_update_id"
  end

  create_table "event_companies", force: :cascade do |t|
    t.integer "role"
    t.integer "event_id", null: false
    t.integer "company_id", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_event_companies_on_company_id"
    t.index ["create_id"], name: "index_event_companies_on_create_id"
    t.index ["discarded_at"], name: "index_event_companies_on_discarded_at"
    t.index ["event_id"], name: "index_event_companies_on_event_id"
    t.index ["update_id"], name: "index_event_companies_on_update_id"
  end

  create_table "event_docs", force: :cascade do |t|
    t.integer "event_id", null: false
    t.boolean "invoice", default: true
    t.boolean "msds", default: false
    t.boolean "packing_list", default: true
    t.boolean "coo", default: false
    t.boolean "l_c", default: false
    t.boolean "van_photo", default: false
    t.boolean "van_repo", default: false
    t.boolean "quarantine", default: false
    t.boolean "slip", default: false
    t.boolean "quotation", default: false
    t.boolean "s_i", default: false
    t.boolean "hbl_awb", default: false
    t.boolean "dg_declaration", default: false
    t.boolean "insurance", default: false
    t.boolean "booking_confirmation", default: false
    t.boolean "mbl", default: false
    t.boolean "freight_memo", default: false
    t.boolean "weight_cert", default: false
    t.boolean "export_permit", default: false
    t.boolean "import_permit", default: false
    t.boolean "dock_receipt", default: false
    t.boolean "house_arrival_notice", default: false
    t.boolean "master_arrival_notice", default: false
    t.boolean "pod", default: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_event_docs_on_create_id"
    t.index ["discarded_at"], name: "index_event_docs_on_discarded_at"
    t.index ["event_id"], name: "index_event_docs_on_event_id"
    t.index ["update_id"], name: "index_event_docs_on_update_id"
  end

  create_table "event_files", force: :cascade do |t|
    t.integer "business_category_id", null: false
    t.integer "event_id", null: false
    t.integer "create_id", null: false
    t.integer "update_id", null: false
    t.string "file_name"
    t.string "file_type"
    t.integer "file_size"
    t.string "verified_name"
    t.boolean "is_estimate", default: false
    t.boolean "is_verified", default: false
    t.boolean "shipper_view", null: false
    t.boolean "consignee_view", null: false
    t.boolean "custom_view", null: false
    t.boolean "agent_view", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["agent_view"], name: "index_event_files_on_agent_view"
    t.index ["business_category_id"], name: "index_event_files_on_business_category_id"
    t.index ["consignee_view"], name: "index_event_files_on_consignee_view"
    t.index ["create_id"], name: "index_event_files_on_create_id"
    t.index ["custom_view"], name: "index_event_files_on_custom_view"
    t.index ["discarded_at"], name: "index_event_files_on_discarded_at"
    t.index ["event_id"], name: "index_event_files_on_event_id"
    t.index ["is_estimate"], name: "index_event_files_on_is_estimate"
    t.index ["is_verified"], name: "index_event_files_on_is_verified"
    t.index ["shipper_view"], name: "index_event_files_on_shipper_view"
    t.index ["update_id"], name: "index_event_files_on_update_id"
  end

  create_table "event_goods", force: :cascade do |t|
    t.integer "event_id", null: false
    t.string "pkg"
    t.string "type_of_pkg"
    t.string "n_w"
    t.string "g_w"
    t.string "three_m"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_event_goods_on_create_id"
    t.index ["event_id"], name: "index_event_goods_on_event_id"
    t.index ["update_id"], name: "index_event_goods_on_update_id"
  end

  create_table "event_schedules", force: :cascade do |t|
    t.integer "event_id", null: false
    t.datetime "container_pick_up"
    t.datetime "vanning_date"
    t.datetime "cut_off_date"
    t.datetime "pol_etd"
    t.datetime "pol_atd"
    t.datetime "pod_eta"
    t.datetime "pod_ata"
    t.datetime "delivery_date"
    t.datetime "kpler_updated_at"
    t.integer "transportation_status"
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_event_schedules_on_create_id"
    t.index ["discarded_at"], name: "index_event_schedules_on_discarded_at"
    t.index ["event_id"], name: "index_event_schedules_on_event_id"
    t.index ["update_id"], name: "index_event_schedules_on_update_id"
  end

  create_table "event_shipment_histories", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "sequence_num", null: false
    t.string "vessel", null: false
    t.string "voyage", null: false
    t.string "port", null: false
    t.integer "local_time_offset", null: false
    t.datetime "arrival_date", null: false
    t.datetime "departure_date", null: false
    t.integer "status", null: false
    t.boolean "is_aborted", default: false
    t.datetime "kpler_aborted_at"
    t.datetime "kpler_updated_at", null: false
    t.integer "update_id"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_event_shipment_histories_on_discarded_at"
    t.index ["event_id"], name: "index_event_shipment_histories_on_event_id"
    t.index ["update_id"], name: "index_event_shipment_histories_on_update_id"
  end

  create_table "event_shipments", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "shipment"
    t.integer "med"
    t.integer "term"
    t.string "place_of_receipt"
    t.string "port_of_loading"
    t.string "port_of_discharge"
    t.string "port_of_delivery"
    t.string "pick_up"
    t.string "delivery"
    t.string "vessel"
    t.string "voyage"
    t.string "booking_no"
    t.string "carrier"
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_event_shipments_on_create_id"
    t.index ["discarded_at"], name: "index_event_shipments_on_discarded_at"
    t.index ["event_id"], name: "index_event_shipments_on_event_id"
    t.index ["update_id"], name: "index_event_shipments_on_update_id"
  end

  create_table "event_steps", force: :cascade do |t|
    t.integer "status", null: false
    t.datetime "status_date", null: false
    t.integer "event_id", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_event_steps_on_create_id"
    t.index ["discarded_at"], name: "index_event_steps_on_discarded_at"
    t.index ["event_id"], name: "index_event_steps_on_event_id"
    t.index ["update_id"], name: "index_event_steps_on_update_id"
  end

  create_table "events", force: :cascade do |t|
    t.integer "forwarder_id", null: false
    t.integer "user_id"
    t.integer "create_id"
    t.integer "update_id"
    t.string "id_string", null: false
    t.string "year", null: false
    t.string "mbl"
    t.string "hbl"
    t.datetime "soa"
    t.boolean "charge"
    t.text "description"
    t.text "remark"
    t.datetime "accounting_month"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["accounting_month"], name: "index_events_on_accounting_month"
    t.index ["create_id"], name: "index_events_on_create_id"
    t.index ["discarded_at"], name: "index_events_on_discarded_at"
    t.index ["forwarder_id"], name: "index_events_on_forwarder_id"
    t.index ["hbl"], name: "index_events_on_hbl"
    t.index ["id_string"], name: "index_events_on_id_string"
    t.index ["mbl"], name: "index_events_on_mbl"
    t.index ["update_id"], name: "index_events_on_update_id"
    t.index ["user_id"], name: "index_events_on_user_id"
    t.index ["year"], name: "index_events_on_year"
  end

  create_table "favorite_companies", force: :cascade do |t|
    t.integer "favorite_id", null: false
    t.integer "company_id", null: false
    t.integer "role", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_favorite_companies_on_company_id"
    t.index ["create_id"], name: "index_favorite_companies_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_companies_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_companies_on_favorite_id"
    t.index ["update_id"], name: "index_favorite_companies_on_update_id"
  end

  create_table "favorite_docs", force: :cascade do |t|
    t.integer "favorite_id", null: false
    t.boolean "invoice", default: true
    t.boolean "msds", default: false
    t.boolean "packing_list", default: true
    t.boolean "coo", default: false
    t.boolean "l_c", default: false
    t.boolean "van_photo", default: false
    t.boolean "van_repo", default: false
    t.boolean "quarantine", default: false
    t.boolean "slip", default: false
    t.boolean "s_i", default: false
    t.boolean "hbl_awb", default: false
    t.boolean "dg_declaration", default: false
    t.boolean "insurance", default: false
    t.boolean "booking_confirmation", default: false
    t.boolean "mbl", default: false
    t.boolean "freight_memo", default: false
    t.boolean "weight_cert", default: false
    t.boolean "export_permit", default: false
    t.boolean "import_permit", default: false
    t.boolean "dock_receipt", default: false
    t.boolean "house_arrival_notice", default: false
    t.boolean "master_arrival_notice", default: false
    t.boolean "pod", default: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorite_docs_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_docs_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_docs_on_favorite_id"
    t.index ["update_id"], name: "index_favorite_docs_on_update_id"
  end

  create_table "favorite_finbalances", force: :cascade do |t|
    t.integer "favorite_id", null: false
    t.integer "finbalance_item_id", null: false
    t.integer "balance", default: 0
    t.integer "income", default: 0
    t.integer "cost", default: 0
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorite_finbalances_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_finbalances_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_finbalances_on_favorite_id"
    t.index ["finbalance_item_id"], name: "index_favorite_finbalances_on_finbalance_item_id"
    t.index ["update_id"], name: "index_favorite_finbalances_on_update_id"
  end

  create_table "favorite_goods", force: :cascade do |t|
    t.integer "favorite_id", null: false
    t.string "pkgs"
    t.string "type_of_pkg"
    t.string "n_w"
    t.string "g_w"
    t.string "m3"
    t.text "description"
    t.text "remark"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorite_goods_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_goods_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_goods_on_favorite_id"
    t.index ["update_id"], name: "index_favorite_goods_on_update_id"
  end

  create_table "favorite_shipments", force: :cascade do |t|
    t.integer "favorite_id", null: false
    t.integer "shipment"
    t.integer "method"
    t.integer "term"
    t.string "place_of_receipt"
    t.string "port_of_loading"
    t.string "port_of_discharge"
    t.string "port_of_delivery"
    t.string "pick_up"
    t.string "delivery"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorite_shipments_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_shipments_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_shipments_on_favorite_id"
    t.index ["update_id"], name: "index_favorite_shipments_on_update_id"
  end

  create_table "favorites", force: :cascade do |t|
    t.string "name", null: false
    t.integer "forwarder_id", null: false
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorites_on_create_id"
    t.index ["discarded_at"], name: "index_favorites_on_discarded_at"
    t.index ["forwarder_id"], name: "index_favorites_on_forwarder_id"
    t.index ["update_id"], name: "index_favorites_on_update_id"
  end

  create_table "finbalance_costs", force: :cascade do |t|
    t.integer "finbalance_id", null: false
    t.integer "finbalance_item_id", null: false
    t.integer "company_id", null: false
    t.integer "amount", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_finbalance_costs_on_company_id"
    t.index ["create_id"], name: "index_finbalance_costs_on_create_id"
    t.index ["discarded_at"], name: "index_finbalance_costs_on_discarded_at"
    t.index ["finbalance_id"], name: "index_finbalance_costs_on_finbalance_id"
    t.index ["finbalance_item_id"], name: "index_finbalance_costs_on_finbalance_item_id"
    t.index ["update_id"], name: "index_finbalance_costs_on_update_id"
  end

  create_table "finbalance_incomes", force: :cascade do |t|
    t.integer "finbalance_id", null: false
    t.integer "finbalance_item_id", null: false
    t.integer "company_id", null: false
    t.integer "amount", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_finbalance_incomes_on_company_id"
    t.index ["create_id"], name: "index_finbalance_incomes_on_create_id"
    t.index ["discarded_at"], name: "index_finbalance_incomes_on_discarded_at"
    t.index ["finbalance_id"], name: "index_finbalance_incomes_on_finbalance_id"
    t.index ["finbalance_item_id"], name: "index_finbalance_incomes_on_finbalance_item_id"
    t.index ["update_id"], name: "index_finbalance_incomes_on_update_id"
  end

  create_table "finbalance_items", force: :cascade do |t|
    t.integer "forwarder_id", null: false
    t.string "item_name", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_finbalance_items_on_create_id"
    t.index ["discarded_at"], name: "index_finbalance_items_on_discarded_at"
    t.index ["forwarder_id"], name: "index_finbalance_items_on_forwarder_id"
    t.index ["update_id"], name: "index_finbalance_items_on_update_id"
  end

  create_table "finbalances", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "finbalance_item_id", null: false
    t.integer "balance", default: 0
    t.integer "income", default: 0
    t.integer "cost", default: 0
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_finbalances_on_create_id"
    t.index ["discarded_at"], name: "index_finbalances_on_discarded_at"
    t.index ["event_id"], name: "index_finbalances_on_event_id"
    t.index ["finbalance_item_id"], name: "index_finbalances_on_finbalance_item_id"
    t.index ["update_id"], name: "index_finbalances_on_update_id"
  end

  create_table "kepler_logs", force: :cascade do |t|
    t.integer "kepler_id", null: false
    t.string "response", null: false
    t.datetime "requested_at", null: false
    t.string "error"
    t.string "requested_api", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_kepler_logs_on_discarded_at"
    t.index ["kepler_id"], name: "index_kepler_logs_on_kepler_id"
  end

  create_table "kpler_histories", force: :cascade do |t|
    t.integer "kepler_log_id", null: false
    t.integer "category", null: false
    t.string "from", null: false
    t.string "to", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_kpler_histories_on_discarded_at"
    t.index ["kepler_log_id"], name: "index_kpler_histories_on_kepler_log_id"
  end

  create_table "kplers", force: :cascade do |t|
    t.integer "event_id", null: false
    t.string "scac", null: false
    t.string "reference_number", null: false
    t.boolean "is_created", default: false
    t.integer "tracking_request_id", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_kplers_on_discarded_at"
    t.index ["event_id"], name: "index_kplers_on_event_id"
    t.index ["is_created"], name: "index_kplers_on_is_created"
    t.index ["tracking_request_id"], name: "index_kplers_on_tracking_request_id"
  end

  create_table "messages", force: :cascade do |t|
    t.integer "chat_id", null: false
    t.integer "user_id", null: false
    t.string "content", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_id"], name: "index_messages_on_chat_id"
    t.index ["create_id"], name: "index_messages_on_create_id"
    t.index ["discarded_at"], name: "index_messages_on_discarded_at"
    t.index ["update_id"], name: "index_messages_on_update_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "port_lists", force: :cascade do |t|
    t.string "name", null: false
    t.string "port_code", null: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.integer "company_id", null: false
    t.string "email", default: "", null: false
    t.string "name", default: "", null: false
    t.string "phone"
    t.string "dept"
    t.integer "role", default: 1
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "last_login_date"
    t.boolean "status", default: true
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.boolean "delay_mail", default: true
    t.boolean "chat_mail", default: true
    t.boolean "status_mail", default: true
    t.integer "delay_days", default: 0
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_users_on_company_id"
    t.index ["confirmed_at"], name: "index_users_on_confirmed_at"
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "chat_users", "users", column: "create_id"
  add_foreign_key "chat_users", "users", column: "update_id"
  add_foreign_key "chats", "events"
  add_foreign_key "chats", "users", column: "create_id"
  add_foreign_key "chats", "users", column: "update_id"
  add_foreign_key "company_business_categories", "business_categories"
  add_foreign_key "company_business_categories", "companies"
  add_foreign_key "containers", "events"
  add_foreign_key "containers", "users", column: "create_id"
  add_foreign_key "containers", "users", column: "update_id"
  add_foreign_key "event_companies", "companies"
  add_foreign_key "event_companies", "events"
  add_foreign_key "event_companies", "users", column: "create_id"
  add_foreign_key "event_companies", "users", column: "update_id"
  add_foreign_key "event_docs", "events"
  add_foreign_key "event_docs", "users", column: "create_id"
  add_foreign_key "event_docs", "users", column: "update_id"
  add_foreign_key "event_files", "business_categories"
  add_foreign_key "event_files", "events"
  add_foreign_key "event_files", "users", column: "create_id"
  add_foreign_key "event_files", "users", column: "update_id"
  add_foreign_key "event_goods", "events"
  add_foreign_key "event_goods", "users", column: "create_id"
  add_foreign_key "event_goods", "users", column: "update_id"
  add_foreign_key "event_schedules", "events"
  add_foreign_key "event_schedules", "users", column: "create_id"
  add_foreign_key "event_schedules", "users", column: "update_id"
  add_foreign_key "event_shipment_histories", "events"
  add_foreign_key "event_shipment_histories", "users", column: "update_id"
  add_foreign_key "event_shipments", "events"
  add_foreign_key "event_shipments", "users", column: "create_id"
  add_foreign_key "event_shipments", "users", column: "update_id"
  add_foreign_key "event_steps", "events"
  add_foreign_key "event_steps", "users", column: "create_id"
  add_foreign_key "event_steps", "users", column: "update_id"
  add_foreign_key "events", "companies", column: "forwarder_id"
  add_foreign_key "events", "users", column: "create_id"
  add_foreign_key "events", "users", column: "update_id"
  add_foreign_key "favorite_companies", "companies"
  add_foreign_key "favorite_companies", "favorites"
  add_foreign_key "favorite_companies", "users", column: "create_id"
  add_foreign_key "favorite_companies", "users", column: "update_id"
  add_foreign_key "favorite_docs", "favorites"
  add_foreign_key "favorite_docs", "users", column: "create_id"
  add_foreign_key "favorite_docs", "users", column: "update_id"
  add_foreign_key "favorite_finbalances", "favorites"
  add_foreign_key "favorite_finbalances", "finbalance_items"
  add_foreign_key "favorite_finbalances", "users", column: "create_id"
  add_foreign_key "favorite_finbalances", "users", column: "update_id"
  add_foreign_key "favorite_goods", "favorites"
  add_foreign_key "favorite_goods", "users", column: "create_id"
  add_foreign_key "favorite_goods", "users", column: "update_id"
  add_foreign_key "favorite_shipments", "favorites"
  add_foreign_key "favorite_shipments", "users", column: "create_id"
  add_foreign_key "favorite_shipments", "users", column: "update_id"
  add_foreign_key "favorites", "companies", column: "forwarder_id"
  add_foreign_key "favorites", "users", column: "create_id"
  add_foreign_key "favorites", "users", column: "update_id"
  add_foreign_key "finbalance_costs", "companies"
  add_foreign_key "finbalance_costs", "finbalance_items"
  add_foreign_key "finbalance_costs", "finbalances"
  add_foreign_key "finbalance_costs", "users", column: "create_id"
  add_foreign_key "finbalance_costs", "users", column: "update_id"
  add_foreign_key "finbalance_incomes", "companies"
  add_foreign_key "finbalance_incomes", "finbalance_items"
  add_foreign_key "finbalance_incomes", "finbalances"
  add_foreign_key "finbalance_incomes", "users", column: "create_id"
  add_foreign_key "finbalance_incomes", "users", column: "update_id"
  add_foreign_key "finbalance_items", "companies", column: "forwarder_id"
  add_foreign_key "finbalance_items", "users", column: "create_id"
  add_foreign_key "finbalance_items", "users", column: "update_id"
  add_foreign_key "finbalances", "events"
  add_foreign_key "finbalances", "finbalance_items"
  add_foreign_key "finbalances", "users", column: "create_id"
  add_foreign_key "finbalances", "users", column: "update_id"
  add_foreign_key "kepler_logs", "keplers"
  add_foreign_key "kpler_histories", "kepler_logs"
  add_foreign_key "kplers", "events"
  add_foreign_key "messages", "chats"
  add_foreign_key "messages", "users"
  add_foreign_key "messages", "users", column: "create_id"
  add_foreign_key "messages", "users", column: "update_id"
  add_foreign_key "users", "companies"
end
