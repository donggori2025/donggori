"use client";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import FactoryImageManager from "@/components/FactoryImageManager";
import FactoryBlobImageManager from "@/components/FactoryBlobImageManager";
import { Factory, ColumnSchema, FactoryForm } from "@/lib/types";

export default function AdminFactoriesPage() {
  const [items, setItems] = useState<Factory[]>([]);
  const [filteredItems, setFilteredItems] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FactoryForm>({});
  const [columns, setColumns] = useState<ColumnSchema[]>([]);
  const [selected, setSelected] = useState<Factory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSelected, setOriginalSelected] = useState<Factory | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, schemaRes] = await Promise.all([
        fetch("/api/admin/factories"),
        fetch("/api/admin/factories/schema"),
      ]);
      const listJson = listRes.ok ? await listRes.json().catch(()=>({ success:false, error:`목록 응답 파싱 실패(${listRes.status})` })) : { success:false, error:`목록 요청 실패(${listRes.status})` };
      const schemaJson = schemaRes.ok ? await schemaRes.json().catch(()=>({ success:false, error:`스키마 응답 파싱 실패(${schemaRes.status})` })) : { success:false, error:`스키마 요청 실패(${schemaRes.status})` };
      
      if (!listRes.ok || !listJson.success) {
        const errorMsg = listJson.error || "목록 불러오기 실패";
        const debugInfo = listJson.debug ? `\n\n디버그 정보: ${JSON.stringify(listJson.debug, null, 2)}` : '';
        throw new Error(`${errorMsg}${debugInfo}`);
      }
      if (!schemaRes.ok || !schemaJson.success) {
        const errorMsg = schemaJson.error || "스키마 불러오기 실패";
        const debugInfo = schemaJson.debug ? `\n\n디버그 정보: ${JSON.stringify(schemaJson.debug, null, 2)}` : '';
        throw new Error(`${errorMsg}${debugInfo}`);
      }
      
      setItems(listJson.data || []);
      setFilteredItems(listJson.data || []);
      setColumns(schemaJson.data || []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "불러오기 실패";
      setError(errorMessage);
      console.error("데이터 로딩 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // 검색 기능
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.company_name && item.company_name.toLowerCase().includes(searchLower)) ||
        (item.address && item.address.toLowerCase().includes(searchLower)) ||
        (item.business_type && item.business_type.toLowerCase().includes(searchLower)) ||
        (item.contact_name && item.contact_name?.toLowerCase().includes(searchLower)) ||
        (item.phone_number && item.phone_number?.toString().includes(searchLower))
      );
    });

    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = Object.fromEntries(Object.entries(form).filter(([k])=>!k.startsWith("__")));
      
      if (Object.keys(formData).length === 0) {
        setError("등록할 데이터가 없습니다.");
        return;
      }

      const res = await fetch("/api/admin/factories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = res.ok ? await res.json().catch(()=>({ success:false, error:`응답 파싱 실패(${res.status})` })) : { success:false, error:`요청 실패(${res.status})` };
      if (!res.ok || !json.success) throw new Error(json.error || "등록 실패");
      setForm({});
      await load();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "등록 실패";
      setError(errorMessage);
      console.error("등록 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: FactoryForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/factories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(Object.entries(patch).filter(([k])=>!k.startsWith("__")))),
      });
      const json = res.ok ? await res.json().catch(()=>({ success:false, error:`응답 파싱 실패(${res.status})` })) : { success:false, error:`요청 실패(${res.status})` };
      if (!res.ok || !json.success) throw new Error(json.error || "수정 실패");
      await load();
      setSelected(null);
      setOriginalSelected(null);
      setHasChanges(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "수정 실패";
      setError(errorMessage);
      console.error("수정 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/factories/${id}`, { method: "DELETE" });
      const json = res.ok ? await res.json().catch(()=>({ success:false, error:`응답 파싱 실패(${res.status})` })) : { success:false, error:`요청 실패(${res.status})` };
      if (!res.ok || !json.success) throw new Error(json.error || "삭제 실패");
      await load();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "삭제 실패";
      setError(errorMessage);
      console.error("삭제 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  // 컬럼명에 대한 한글명 매핑
  const getColumnDisplayName = (columnName: string) => {
    const columnNames: Record<string, string> = {
      id: "ID",
      company_name: "업장명",
      address: "주소",
      business_type: "업종",
      phone_number: "연락처",
      moq: "최소주문량",
      monthly_capacity: "월생산량",
      admin_district: "행정구역",
      intro: "소개",
      lat: "위도",
      lng: "경도",
      image: "이미지",
      created_at: "생성일",
      updated_at: "수정일",
      owner_user_id: "소유자ID",
      email: "이메일",
      contact_name: "담당자명",
      established_year: "설립년도",
      main_fabrics: "주요원단",
      distribution: "유통",
      delivery: "배송",
      factory_type: "공장유형",
      equipment: "장비",
      sewing_machines: "재봉틀",
      pattern_machines: "패턴기",
      special_machines: "특수기계",
      top_items_upper: "상의주요품목",
      top_items_lower: "하의주요품목",
      top_items_outer: "외투주요품목",
      top_items_dress_skirt: "드레스/스커트주요품목",
      top_items_bag: "가방주요품목",
      top_items_fashion_accessory: "패션잡화주요품목",
      top_items_underwear: "속옷주요품목",
      top_items_sports_leisure: "스포츠/레저주요품목",
      top_items_pet: "펫용품주요품목",
      processes: "공정",
      kakao_url: "카카오URL"
    };
    
    return columnNames[columnName] || columnName;
  };

  // 이미지 필드 처리 함수
  const handleImageChange = (images: string[]) => {
    setForm((prev: FactoryForm) => ({ ...prev, images: images }));
  };

  // 선택된 업장 수정 시 원본 데이터 저장
  const handleSelectItem = (item: Factory) => {
    setSelected(item);
    setOriginalSelected(JSON.parse(JSON.stringify(item))); // 깊은 복사
    setHasChanges(false);
  };

  // 필드 변경 시 변경사항 체크
  const handleFieldChange = (field: string, value: unknown) => {
    setSelected((prev) => prev ? { ...prev, [field]: value } : null);
    
    // 변경사항 체크
    if (originalSelected && originalSelected[field] !== value) {
      setHasChanges(true);
    }
  };

  // 변경사항 저장
  const handleSaveChanges = () => {
    if (selected) {
      const formData = Object.fromEntries(
        Object.entries(selected).filter(([k]) => !k.startsWith("__"))
      );
      update(selected.id, formData);
    }
  };

  // 변경사항 취소
  const handleCancelChanges = () => {
    setSelected(originalSelected);
    setHasChanges(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-4">업장 관리</h1>
      <div className="flex items-center justify-between mb-6">
        {hasChanges && (
          <button 
            onClick={handleSaveChanges}
            className="bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            변경사항 저장
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 font-medium">오류 발생</div>
          </div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">새 업장 등록</h2>
        
        {columns.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">정보 입력</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.map((c:ColumnSchema) => {
                // 이미지 필드는 별도 컴포넌트로 처리
                if (c.column_name === 'images' || c.column_name === 'image') {
                  return (
                    <div key={c.column_name} className="md:col-span-2 lg:col-span-3">
                      <ImageUpload
                        onImagesChange={handleImageChange}
                        currentImages={form.images || []}
                        multiple={true}
                      />
                    </div>
                  );
                }

                return (
                  <div key={c.column_name} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {getColumnDisplayName(c.column_name)} ({c.column_name})
                      <span className="text-xs text-gray-500 ml-1">
                        ({c.data_type}{c.is_nullable ? '' : ', 필수'})
                      </span>
                    </label>
                    {c.column_name === 'id' ? (
                      <input 
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" 
                        value="자동 생성" 
                        disabled
                        readOnly
                      />
                    ) : (
                      <input 
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        value={(form as any)[c.column_name] ?? ""} 
                        onChange={(e)=>setForm(v=>({ ...v, [c.column_name]: e.target.value }))} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button 
          disabled={loading} 
          onClick={submit} 
          className="w-full bg-black text-white rounded-lg px-4 py-3 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "처리 중..." : "업장 등록"}
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">등록된 업장 목록</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="업장명, 주소, 업종으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-500">
              {filteredItems.length}개 업장
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 업장이 없습니다."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-lg text-gray-800 truncate">{item.company_name || '업장명 없음'}</div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{item.address || '주소 없음'}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">업종: {item.business_type || '-'}</div>
                    <div className="text-sm text-gray-600">연락처: {item.phone_number || '-'}</div>
                    {item.moq && <div className="text-sm text-gray-600">MOQ: {item.moq}</div>}
                  </div>

                  {(() => {
                    const images = item.images || [];
                    const hasImage = item.image;
                    const totalImages = images.length + (hasImage && !images.includes(item.image) ? 1 : 0);
                    
                    if (totalImages === 0) return null;
                    
                    const displayImages = [...images];
                    if (hasImage && !displayImages.includes(item.image)) {
                      displayImages.unshift(item.image);
                    }
                    
                    return (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          이미지 ({totalImages}개):
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {displayImages.slice(0, 4).map((imageUrl: string, index: number) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`업장 이미지 ${index + 1}`}
                              className="w-full h-16 object-cover rounded border"
                            />
                          ))}
                          {totalImages > 4 && (
                            <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                              +{totalImages - 4}개 더
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex gap-2 pt-2">
                    <button 
                      className="flex-1 bg-black text-white rounded-lg px-3 py-2 text-sm hover:bg-gray-800 transition-colors" 
                      onClick={()=>handleSelectItem(item)}
                    >
                      정보수정
                    </button>
                    <button 
                      className="flex-1 bg-gray-400 text-white rounded-lg px-3 py-2 text-sm hover:bg-gray-500 transition-colors" 
                      onClick={()=>remove(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">상세 수정: {selected.company_name || selected.id}</div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    변경사항 있음
                  </span>
                )}
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={()=>{
                    setSelected(null);
                    setOriginalSelected(null);
                    setHasChanges(false);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns.map((c:ColumnSchema) => {
                // 이미지 필드는 별도 컴포넌트로 처리
                if (c.column_name === 'images' || c.column_name === 'image') {
                  return (
                    <div key={c.column_name} className="md:col-span-2">
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            새 이미지 업로드 (DB images)
                          </label>
                          <ImageUpload
                            onImagesChange={(newImages) => {
                              const currentImages = selected.images || [];
                              const updatedImages = [...currentImages, ...newImages];
                              handleFieldChange('images', updatedImages);
                            }}
                            currentImages={[]}
                            multiple={true}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Blob 이미지 관리 (폴더: 업장명 기반)
                          </label>
                          <FactoryBlobImageManager folder={selected.company_name || ''} />
                        </div>

                        {(() => {
                          const images = selected.images || [];
                          const hasImage = selected.image;
                          const totalImages = images.length + (hasImage && !images.includes(selected.image) ? 1 : 0);
                          
                          if (totalImages === 0) return null;
                          
                          const displayImages = [...images];
                          if (hasImage && !displayImages.includes(selected.image)) {
                            displayImages.unshift(selected.image);
                          }
                          
                          return (
                            <div className="border-t pt-4">
                              <FactoryImageManager
                                factoryId={selected.id}
                                images={displayImages}
                                onImagesChange={(updatedImages) => {
                                  handleFieldChange('images', updatedImages);
                                }}
                                isEditing={true}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={c.column_name} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {getColumnDisplayName(c.column_name)} ({c.column_name})
                    </label>
                    {c.column_name === 'id' ? (
                      <input 
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" 
                        value={selected.id || "자동 생성"} 
                        disabled
                        readOnly
                      />
                    ) : (
                      <input 
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        value={(selected as Factory)[c.column_name] ?? ""} 
                        onChange={(e)=>handleFieldChange(c.column_name, e.target.value)} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors" 
                onClick={handleSaveChanges}
                disabled={!hasChanges}
              >
                변경사항 저장
              </button>
              {hasChanges && (
                <button 
                  className="bg-gray-600 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors" 
                  onClick={handleCancelChanges}
                >
                  변경사항 취소
                </button>
              )}
              <button 
                className="bg-gray-600 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors" 
                onClick={()=>{
                  setSelected(null);
                  setOriginalSelected(null);
                  setHasChanges(false);
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


