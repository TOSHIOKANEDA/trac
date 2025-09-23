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

ActiveRecord::Schema[7.2].define(version: 2025_11_05_131200) do
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

  create_table "carriers", force: :cascade do |t|
    t.integer "company_business_category_id", null: false
    t.string "scac", null: false
    t.datetime "discarded_at"
    t.boolean "is_air", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_business_category_id"], name: "index_carriers_on_company_business_category_id"
    t.index ["discarded_at"], name: "index_carriers_on_discarded_at"
    t.index ["is_air"], name: "index_carriers_on_is_air"
    t.index ["scac"], name: "index_carriers_on_scac"
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
    t.index ["discarded_at"], name: "index_chat_users_on_discarded_at"
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
    t.integer "industry_id"
    t.integer "forwarder_id", null: false
    t.integer "company_id", null: false
    t.integer "business_category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_category_id"], name: "index_company_business_categories_on_business_category_id"
    t.index ["company_id"], name: "index_company_business_categories_on_company_id"
    t.index ["discarded_at"], name: "index_company_business_categories_on_discarded_at"
    t.index ["forwarder_id"], name: "index_company_business_categories_on_forwarder_id"
    t.index ["industry_id"], name: "index_company_business_categories_on_industry_id"
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
    t.boolean "completed", default: false
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
    t.string "verified_doc"
    t.string "verified_name"
    t.boolean "is_estimate", default: false
    t.boolean "is_verified", default: false
    t.boolean "shipper_view", default: false
    t.boolean "consignee_view", default: false
    t.boolean "custom_view", default: false
    t.boolean "agent_view", default: false
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

  create_table "event_finbalance_assemblies", force: :cascade do |t|
    t.integer "event_finbalance_id", null: false
    t.integer "finbalance_item_id", null: false
    t.string "unit"
    t.boolean "tax_flag", default: false
    t.string "currency", default: "JPY"
    t.decimal "exchange_rate", precision: 10, scale: 4, default: "1.0"
    t.decimal "quantity", precision: 10, scale: 4, default: "0.0"
    t.integer "purchase_unit_price", default: 0
    t.integer "purchase_amount", default: 0
    t.integer "sales_unit_price", default: 0
    t.integer "sales_amount", default: 0
    t.integer "gross_profit", default: 0
    t.decimal "gross_profit_rate", precision: 5, scale: 2, default: "0.0"
    t.text "item_remark"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_event_finbalance_assemblies_on_discarded_at"
    t.index ["event_finbalance_id"], name: "index_event_finbalance_assemblies_on_event_finbalance_id"
    t.index ["finbalance_item_id"], name: "index_event_finbalance_assemblies_on_finbalance_item_id"
  end

  create_table "event_finbalances", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "user_id", null: false
    t.integer "company_id"
    t.string "client_pic_name"
    t.string "subject"
    t.text "remark"
    t.date "due_date"
    t.integer "income", default: 0
    t.integer "expense", default: 0
    t.integer "balance", default: 0
    t.integer "small_total", default: 0
    t.integer "comumption_tax_total", default: 0
    t.integer "total_amount", default: 0
    t.integer "tax_percent", default: 10
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_event_finbalances_on_company_id"
    t.index ["create_id"], name: "index_event_finbalances_on_create_id"
    t.index ["discarded_at"], name: "index_event_finbalances_on_discarded_at"
    t.index ["event_id"], name: "index_event_finbalances_on_event_id"
    t.index ["update_id"], name: "index_event_finbalances_on_update_id"
    t.index ["user_id"], name: "index_event_finbalances_on_user_id"
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
    t.index ["discarded_at"], name: "index_event_goods_on_discarded_at"
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

  create_table "event_shipments", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "carrier_id"
    t.integer "shipment"
    t.integer "mode"
    t.integer "term"
    t.string "pol_code"
    t.string "pod_code"
    t.string "place_of_receipt"
    t.string "port_of_loading"
    t.string "port_of_discharge"
    t.string "port_of_delivery"
    t.string "pick_up"
    t.string "delivery"
    t.string "vessel"
    t.string "voyage"
    t.string "booking_no"
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["carrier_id"], name: "index_event_shipments_on_carrier_id"
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

  create_table "event_transhipments", force: :cascade do |t|
    t.integer "event_schedule_id", null: false
    t.string "arrival_or_departure"
    t.string "event_status"
    t.string "event_date_time"
    t.string "mode_of_transport"
    t.string "voyage_number"
    t.string "vessel_name"
    t.string "port_unicode"
    t.string "port_name"
    t.string "location_action"
    t.string "kpler_location_id"
    t.string "kpler_vessel_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_schedule_id"], name: "index_event_transhipments_on_event_schedule_id"
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
    t.boolean "file_pasted", default: false
    t.integer "containers_count", default: 0
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
    t.boolean "completed", default: false
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

  create_table "favorite_files", force: :cascade do |t|
    t.integer "business_category_id", null: false
    t.integer "favorite_id", null: false
    t.integer "create_id", null: false
    t.integer "update_id", null: false
    t.string "file_name"
    t.string "file_type"
    t.integer "file_size"
    t.string "verified_doc"
    t.string "verified_name"
    t.boolean "is_estimate", default: false
    t.boolean "is_verified", default: false
    t.boolean "shipper_view", default: false
    t.boolean "consignee_view", default: false
    t.boolean "custom_view", default: false
    t.boolean "agent_view", default: false
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["agent_view"], name: "index_favorite_files_on_agent_view"
    t.index ["business_category_id"], name: "index_favorite_files_on_business_category_id"
    t.index ["consignee_view"], name: "index_favorite_files_on_consignee_view"
    t.index ["create_id"], name: "index_favorite_files_on_create_id"
    t.index ["custom_view"], name: "index_favorite_files_on_custom_view"
    t.index ["discarded_at"], name: "index_favorite_files_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_files_on_favorite_id"
    t.index ["is_estimate"], name: "index_favorite_files_on_is_estimate"
    t.index ["is_verified"], name: "index_favorite_files_on_is_verified"
    t.index ["shipper_view"], name: "index_favorite_files_on_shipper_view"
    t.index ["update_id"], name: "index_favorite_files_on_update_id"
  end

  create_table "favorite_finbalance_assemblies", force: :cascade do |t|
    t.integer "favorite_finbalance_id", null: false
    t.integer "finbalance_item_id", null: false
    t.string "unit"
    t.boolean "tax_flag", default: false
    t.string "currency", default: "JPY"
    t.decimal "exchange_rate", precision: 10, scale: 4, default: "1.0"
    t.decimal "quantity", precision: 10, scale: 4, default: "0.0"
    t.integer "purchase_unit_price", default: 0
    t.integer "purchase_amount", default: 0
    t.integer "sales_unit_price", default: 0
    t.integer "sales_amount", default: 0
    t.integer "gross_profit", default: 0
    t.decimal "gross_profit_rate", precision: 5, scale: 2, default: "0.0"
    t.text "item_remark"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_favorite_finbalance_assemblies_on_discarded_at"
    t.index ["favorite_finbalance_id"], name: "index_favorite_finbalance_assemblies_on_favorite_finbalance_id"
    t.index ["finbalance_item_id"], name: "index_favorite_finbalance_assemblies_on_finbalance_item_id"
  end

  create_table "favorite_finbalances", force: :cascade do |t|
    t.integer "favorite_id", null: false
    t.integer "user_id", null: false
    t.string "client_pic_name"
    t.string "subject"
    t.text "remark"
    t.date "due_date"
    t.integer "income", default: 0
    t.integer "expense", default: 0
    t.integer "balance", default: 0
    t.integer "small_total", default: 0
    t.integer "comumption_tax_total", default: 0
    t.integer "total_amount", default: 0
    t.integer "tax_percent", default: 10
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorite_finbalances_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_finbalances_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_finbalances_on_favorite_id"
    t.index ["update_id"], name: "index_favorite_finbalances_on_update_id"
    t.index ["user_id"], name: "index_favorite_finbalances_on_user_id"
  end

  create_table "favorite_goods", force: :cascade do |t|
    t.integer "favorite_id", null: false
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
    t.index ["create_id"], name: "index_favorite_goods_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_goods_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_goods_on_favorite_id"
    t.index ["update_id"], name: "index_favorite_goods_on_update_id"
  end

  create_table "favorite_shipments", force: :cascade do |t|
    t.integer "favorite_id", null: false
    t.integer "shipment"
    t.integer "mode"
    t.integer "term"
    t.string "place_of_receipt"
    t.string "port_of_loading"
    t.string "port_of_discharge"
    t.string "port_of_delivery"
    t.string "pick_up"
    t.string "delivery"
    t.string "carrier"
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorite_shipments_on_create_id"
    t.index ["discarded_at"], name: "index_favorite_shipments_on_discarded_at"
    t.index ["favorite_id"], name: "index_favorite_shipments_on_favorite_id"
    t.index ["update_id"], name: "index_favorite_shipments_on_update_id"
  end

  create_table "favorites", force: :cascade do |t|
    t.integer "forwarder_id", null: false
    t.string "name", null: false
    t.integer "create_id"
    t.integer "update_id"
    t.text "description"
    t.text "remark"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_favorites_on_create_id"
    t.index ["discarded_at"], name: "index_favorites_on_discarded_at"
    t.index ["forwarder_id"], name: "index_favorites_on_forwarder_id"
    t.index ["update_id"], name: "index_favorites_on_update_id"
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

  create_table "industries", force: :cascade do |t|
    t.string "industry_name", null: false
    t.integer "inumber"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_industries_on_discarded_at"
    t.index ["industry_name"], name: "index_industries_on_industry_name"
  end

  create_table "kpler_histories", force: :cascade do |t|
    t.integer "kpler_log_id", null: false
    t.integer "category", null: false
    t.string "from", null: false
    t.string "to", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kpler_log_id"], name: "index_kpler_histories_on_kpler_log_id"
  end

  create_table "kpler_logs", force: :cascade do |t|
    t.integer "kpler_id", null: false
    t.integer "type"
    t.string "status"
    t.string "fail_reason"
    t.string "error_description"
    t.string "error_code"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kpler_id"], name: "index_kpler_logs_on_kpler_id"
  end

  create_table "kpler_milestone_locations", force: :cascade do |t|
    t.integer "kpler_milestone_transportation_id", null: false
    t.string "kpler_location_id"
    t.string "port_unicode"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kpler_milestone_transportation_id"], name: "idx_on_kpler_milestone_transportation_id_656aa1af56"
  end

  create_table "kpler_milestone_transportations", force: :cascade do |t|
    t.integer "kpler_id", null: false
    t.string "arrival_or_departure"
    t.string "event_status"
    t.string "event_date_time"
    t.string "mode_of_transport"
    t.string "voyage_number"
    t.string "vessel_name"
    t.string "port_unicode"
    t.string "port_name"
    t.string "location_action"
    t.string "kpler_location_id"
    t.string "kpler_vessel_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kpler_id"], name: "index_kpler_milestone_transportations_on_kpler_id"
  end

  create_table "kpler_milestone_vessels", force: :cascade do |t|
    t.integer "kpler_milestone_transportation_id", null: false
    t.string "kpler_vessel_id"
    t.string "voyage_number"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["kpler_milestone_transportation_id"], name: "idx_on_kpler_milestone_transportation_id_77601bf89f"
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
    t.index ["discarded_at"], name: "index_port_lists_on_discarded_at"
  end

  create_table "quotation_companies", force: :cascade do |t|
    t.integer "company_id", null: false
    t.integer "quotation_id", null: false
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_quotation_companies_on_company_id"
    t.index ["create_id"], name: "index_quotation_companies_on_create_id"
    t.index ["discarded_at"], name: "index_quotation_companies_on_discarded_at"
    t.index ["quotation_id"], name: "index_quotation_companies_on_quotation_id"
    t.index ["update_id"], name: "index_quotation_companies_on_update_id"
  end

  create_table "quotation_items", force: :cascade do |t|
    t.integer "finbalance_item_id"
    t.integer "quotation_id", null: false
    t.integer "item_type"
    t.string "item_name_note"
    t.boolean "tax_flag", default: false
    t.float "unit"
    t.integer "section"
    t.string "currency"
    t.string "item_remark"
    t.float "exchange_rate"
    t.decimal "quantity"
    t.decimal "purchase_unit_price"
    t.decimal "purchase_amount", default: "0.0"
    t.decimal "sales_unit_price"
    t.decimal "sales_amount", default: "0.0"
    t.decimal "gross_profit", default: "0.0"
    t.decimal "gross_profit_rate", default: "0.0"
    t.datetime "discarded_at"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["create_id"], name: "index_quotation_items_on_create_id"
    t.index ["discarded_at"], name: "index_quotation_items_on_discarded_at"
    t.index ["finbalance_item_id"], name: "index_quotation_items_on_finbalance_item_id"
    t.index ["quotation_id"], name: "index_quotation_items_on_quotation_id"
    t.index ["update_id"], name: "index_quotation_items_on_update_id"
  end

  create_table "quotations", force: :cascade do |t|
    t.integer "forwarder_id", null: false
    t.integer "client_id", null: false
    t.integer "user_id", null: false
    t.string "client_pic_name"
    t.string "place_of_receipt"
    t.string "port_of_loading"
    t.string "port_of_discharge"
    t.string "port_of_delivery"
    t.integer "tax_percent"
    t.string "carrier"
    t.datetime "issue_at"
    t.string "valid_at"
    t.integer "shipment"
    t.integer "mode"
    t.integer "term"
    t.string "cargo"
    t.integer "total_amount"
    t.datetime "discarded_at"
    t.string "remark"
    t.string "condition"
    t.boolean "issued_in_english", default: false
    t.boolean "issued_by_foreign_currency", default: false
    t.boolean "is_air", default: false
    t.string "currency"
    t.float "exchange_rate"
    t.integer "create_id"
    t.integer "update_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_quotations_on_client_id"
    t.index ["create_id"], name: "index_quotations_on_create_id"
    t.index ["discarded_at"], name: "index_quotations_on_discarded_at"
    t.index ["forwarder_id"], name: "index_quotations_on_forwarder_id"
    t.index ["update_id"], name: "index_quotations_on_update_id"
    t.index ["user_id"], name: "index_quotations_on_user_id"
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
  add_foreign_key "carriers", "company_business_categories"
  add_foreign_key "chat_users", "users", column: "create_id"
  add_foreign_key "chat_users", "users", column: "update_id"
  add_foreign_key "chats", "events"
  add_foreign_key "chats", "users", column: "create_id"
  add_foreign_key "chats", "users", column: "update_id"
  add_foreign_key "company_business_categories", "business_categories"
  add_foreign_key "company_business_categories", "companies"
  add_foreign_key "company_business_categories", "companies", column: "forwarder_id"
  add_foreign_key "company_business_categories", "industries"
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
  add_foreign_key "event_finbalance_assemblies", "event_finbalances"
  add_foreign_key "event_finbalance_assemblies", "finbalance_items"
  add_foreign_key "event_finbalances", "events"
  add_foreign_key "event_finbalances", "users"
  add_foreign_key "event_finbalances", "users", column: "create_id"
  add_foreign_key "event_finbalances", "users", column: "update_id"
  add_foreign_key "event_goods", "events"
  add_foreign_key "event_goods", "users", column: "create_id"
  add_foreign_key "event_goods", "users", column: "update_id"
  add_foreign_key "event_schedules", "events"
  add_foreign_key "event_schedules", "users", column: "create_id"
  add_foreign_key "event_schedules", "users", column: "update_id"
  add_foreign_key "event_shipments", "events"
  add_foreign_key "event_shipments", "users", column: "create_id"
  add_foreign_key "event_shipments", "users", column: "update_id"
  add_foreign_key "event_steps", "events"
  add_foreign_key "event_steps", "users", column: "create_id"
  add_foreign_key "event_steps", "users", column: "update_id"
  add_foreign_key "event_transhipments", "event_schedules"
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
  add_foreign_key "favorite_files", "business_categories"
  add_foreign_key "favorite_files", "favorites"
  add_foreign_key "favorite_files", "users", column: "create_id"
  add_foreign_key "favorite_files", "users", column: "update_id"
  add_foreign_key "favorite_finbalance_assemblies", "favorite_finbalances"
  add_foreign_key "favorite_finbalance_assemblies", "finbalance_items"
  add_foreign_key "favorite_finbalances", "favorites"
  add_foreign_key "favorite_finbalances", "users"
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
  add_foreign_key "finbalance_items", "companies", column: "forwarder_id"
  add_foreign_key "finbalance_items", "users", column: "create_id"
  add_foreign_key "finbalance_items", "users", column: "update_id"
  add_foreign_key "kpler_histories", "kpler_logs"
  add_foreign_key "kpler_logs", "kplers"
  add_foreign_key "kpler_milestone_locations", "kpler_milestone_transportations"
  add_foreign_key "kpler_milestone_transportations", "kplers"
  add_foreign_key "kpler_milestone_vessels", "kpler_milestone_transportations"
  add_foreign_key "kplers", "events"
  add_foreign_key "messages", "chats"
  add_foreign_key "messages", "users"
  add_foreign_key "messages", "users", column: "create_id"
  add_foreign_key "messages", "users", column: "update_id"
  add_foreign_key "quotation_companies", "companies"
  add_foreign_key "quotation_companies", "quotations"
  add_foreign_key "quotation_companies", "users", column: "create_id"
  add_foreign_key "quotation_companies", "users", column: "update_id"
  add_foreign_key "quotation_items", "finbalance_items"
  add_foreign_key "quotation_items", "quotations"
  add_foreign_key "quotation_items", "users", column: "create_id"
  add_foreign_key "quotation_items", "users", column: "update_id"
  add_foreign_key "quotations", "companies", column: "client_id"
  add_foreign_key "quotations", "companies", column: "forwarder_id"
  add_foreign_key "quotations", "users"
  add_foreign_key "quotations", "users", column: "create_id"
  add_foreign_key "quotations", "users", column: "update_id"
  add_foreign_key "users", "companies"
end
